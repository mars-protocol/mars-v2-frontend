import { MsgExecuteContract } from '@delphi-labs/shuttle-react'
import moment from 'moment'
import { isMobile } from 'react-device-detect'
import { GetState, SetState } from 'zustand'

import { ENV } from 'constants/env'
import { Store } from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { ExecuteMsg as AccountNftExecuteMsg } from 'types/generated/mars-account-nft/MarsAccountNft.types'
import {
  Action,
  ActionCoin,
  Action as CreditManagerAction,
  ExecuteMsg as CreditManagerExecuteMsg,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { AccountKind } from 'types/generated/mars-rover-health-types/MarsRoverHealthTypes.types'
import { getAssetByDenom, getAssetBySymbol, getPythAssets } from 'utils/assets'
import { generateErrorMessage, getSingleValueFromBroadcastResult } from 'utils/broadcast'
import checkAutoLendEnabled from 'utils/checkAutoLendEnabled'
import { defaultFee } from 'utils/constants'
import { formatAmountWithSymbol } from 'utils/formatters'
import getTokenOutFromSwapResponse from 'utils/getTokenOutFromSwapResponse'
import { BN } from 'utils/helpers'
import { getVaultDepositCoinsFromActions } from 'utils/vaults'

function generateExecutionMessage(
  sender: string | undefined = '',
  contract: string,
  msg: CreditManagerExecuteMsg | AccountNftExecuteMsg | PythUpdateExecuteMsg,
  funds: Coin[],
) {
  return new MsgExecuteContract({
    sender,
    contract,
    msg,
    funds,
  })
}

export default function createBroadcastSlice(
  set: SetState<Store>,
  get: GetState<Store>,
): BroadcastSlice {
  const handleResponseMessages = (props: HandleResponseProps) => {
    const { id, accountId, response, action, lend, changes, target, message } = props
    if (!response) return

    if (response.error || response.result?.response.code !== 0) {
      set({
        toast: {
          id,
          message: generateErrorMessage(response),
          isError: true,
          hash: response.result?.hash,
        },
      })
      return
    }

    const toast: ToastResponse = {
      id,
      accountId: accountId,
      isError: false,
      hash: response?.result?.hash,
      content: [],
      timestamp: moment().unix(),
      address: get().address ?? '',
    }

    if (message) {
      toast.message = message
      set({ toast })
      return
    }

    if (!changes) return

    switch (action) {
      case 'borrow':
        const borrowCoin = changes.debts ? [changes.debts[0].toCoin()] : []
        const borrowAction = lend ? 'Borrowed and lent' : 'Borrowed'
        toast.content.push({
          coins: borrowCoin,
          text: target === 'wallet' ? 'Borrowed to wallet' : borrowAction,
        })
        break

      case 'withdraw':
        toast.content.push({
          coins: changes.deposits?.map((deposit) => deposit.toCoin()) ?? [],
          text: target === 'wallet' ? 'Withdrew to Wallet' : 'Unlent',
        })
        break

      case 'deposit':
        toast.content.push({
          coins: changes.deposits?.map((deposit) => deposit.toCoin()) ?? [],
          text: lend ? 'Deposited and lent' : 'Deposited',
        })
        break

      case 'lend':
        const lendCoin = changes.lends ? [changes.lends[0].toCoin()] : []
        toast.content.push({
          coins: lendCoin,
          text: 'Lent',
        })
        break

      case 'repay':
        const repayCoin = changes.deposits ? [changes.deposits[0].toCoin()] : []
        toast.content.push({
          coins: repayCoin,
          text: 'Repaid',
        })
        break

      case 'vault':
      case 'vaultCreate':
        toast.content.push({
          coins: changes.deposits?.map((debt) => debt.toCoin()) ?? [],
          text: action === 'vaultCreate' ? 'Created a Vault Position' : 'Added to Vault Position',
        })
    }

    set({ toast })
    return
  }

  const getEstimatedFee = async (messages: MsgExecuteContract[]) => {
    if (!get().client) {
      return defaultFee
    }
    try {
      const simulateResult = await get().client?.simulate({
        messages,
        wallet: get().client?.connectedWallet,
      })

      if (simulateResult) {
        const { success, fee } = simulateResult

        if (success) {
          return {
            amount: fee ? fee.amount : [],
            gas: BN(fee ? fee.gas : 0).toFixed(0),
          }
        }
      }

      throw 'Simulation failed'
    } catch (ex) {
      return defaultFee
    }
  }

  return {
    toast: null,
    borrow: async (options: { accountId: string; coin: BNCoin; borrowToWallet: boolean }) => {
      const borrowAction: Action = { borrow: options.coin.toCoin() }
      const withdrawAction: Action = { withdraw: options.coin.toActionCoin() }
      const actions = options.borrowToWallet ? [borrowAction, withdrawAction] : [borrowAction]

      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions,
        },
      }

      if (
        !options.borrowToWallet &&
        checkAutoLendEnabled(options.accountId) &&
        getAssetByDenom(options.coin.denom)?.isAutoLendEnabled
      ) {
        msg.update_credit_account.actions.push({
          lend: { denom: options.coin.denom, amount: 'account_balance' },
        })
      }
      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'borrow',
          lend: checkAutoLendEnabled(options.accountId),
          target: options.borrowToWallet ? 'wallet' : 'account',
          accountId: options.accountId,
          changes: { debts: [options.coin] },
        },
      })

      return response.then((response) => !!response.result)
    },
    createAccount: async (accountKind: AccountKind) => {
      const msg: CreditManagerExecuteMsg = {
        create_credit_account: accountKind,
      }

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'create',
          message: `Created the Credit Account`,
        },
      })

      return response.then((response) =>
        response.result
          ? getSingleValueFromBroadcastResult(response.result, 'wasm', 'token_id')
          : null,
      )
    },
    deleteAccount: async (options: { accountId: string; lends: BNCoin[] }) => {
      const reclaimMsg = options.lends.map((coin) => {
        return {
          reclaim: coin.toActionCoin(true),
        }
      })

      const refundMessage: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [...reclaimMsg, { refund_all_coin_balances: {} }],
        },
      }

      const burnMessage: AccountNftExecuteMsg = {
        burn: {
          token_id: options.accountId,
        },
      }

      const response = get().executeMsg({
        messages: [
          generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, refundMessage, []),
          generateExecutionMessage(get().address, ENV.ADDRESS_ACCOUNT_NFT, burnMessage, []),
        ],
      })

      get().setToast({
        response,
        options: {
          action: 'delete',
          accountId: options.accountId,
          message: `Deleted the Credit Account`,
        },
      })

      return response.then((response) => !!response.result)
    },
    claimRewards: (options: { accountId: string }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              claim_rewards: {},
            },
          ],
        },
      }

      const messages = [
        generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, []),
      ]
      const estimateFee = () => getEstimatedFee(messages)

      const execute = async () => {
        const response = get().executeMsg({
          messages,
        })

        get().setToast({
          response,
          options: {
            action: 'claim',
            accountId: options.accountId,
            message: `Claimed rewards`,
          },
        })

        return response.then((response) => !!response.result)
      }

      return { estimateFee, execute }
    },
    deposit: async (options: { accountId: string; coins: BNCoin[]; lend: boolean }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.coins.map((coin) => ({
            deposit: coin.toCoin(),
          })),
        },
      }

      if (options.lend) {
        msg.update_credit_account.actions.push(
          ...options.coins
            .filter((coin) => getAssetByDenom(coin.denom)?.isAutoLendEnabled)
            .map((coin) => ({ lend: coin.toActionCoin(options.lend) })),
        )
      }

      const funds = options.coins.map((coin) => coin.toCoin())

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, funds)],
      })

      get().setToast({
        response,
        options: {
          action: 'deposit',
          lend: options.lend,
          accountId: options.accountId,
          changes: { deposits: options.coins },
        },
      })

      return response.then((response) => !!response.result)
    },
    unlock: async (options: { accountId: string; vault: DepositedVault; amount: string }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              request_vault_unlock: {
                vault: { address: options.vault.address },
                amount: options.amount,
              },
            },
          ],
        },
      }

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'unlock',
          accountId: options.accountId,
          message: `Requested unlock for ${options.vault.name}`,
        },
      })

      return response.then((response) => !!response.result)
    },

    withdrawFromVaults: async (options: {
      accountId: string
      vaults: DepositedVault[]
      slippage: number
    }) => {
      const actions: CreditManagerAction[] = []
      options.vaults.forEach((vault) => {
        if (vault.unlockId) {
          actions.push({
            exit_vault_unlocked: {
              id: vault.unlockId,
              vault: { address: vault.address },
            },
          })
          actions.push({
            withdraw_liquidity: {
              lp_token: { denom: vault.denoms.lp, amount: 'account_balance' },
              slippage: options.slippage.toString(),
            },
          })
        }
      })
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions,
        },
      }

      if (checkAutoLendEnabled(options.accountId)) {
        for (const vault of options.vaults) {
          for (const symbol of Object.values(vault.symbols)) {
            const asset = getAssetBySymbol(symbol)
            if (asset?.isAutoLendEnabled) {
              msg.update_credit_account.actions.push({
                lend: { denom: asset.denom, amount: 'account_balance' },
              })
            }
          }
        }
      }

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      const vaultsString = options.vaults.length === 1 ? 'vault' : 'vaults'

      get().setToast({
        response,
        options: {
          action: 'withdraw',
          accountId: options.accountId,
          message: `Withdrew ${options.vaults.length} unlocked ${vaultsString} to the account`,
        },
      })

      return response.then((response) => !!response.result)
    },
    depositIntoVault: async (options: {
      accountId: string
      actions: Action[]
      deposits: BNCoin[]
      borrowings: BNCoin[]
      isCreate: boolean
      kind: AccountKind
    }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.actions,
        },
      }

      const response = get().executeMsg({
        messages: [
          generateExecutionMessage(
            get().address,
            ENV.ADDRESS_CREDIT_MANAGER,
            msg,
            options.kind === 'default' ? [] : options.deposits.map((coin) => coin.toCoin()),
          ),
        ],
      })

      const depositedCoins = getVaultDepositCoinsFromActions(options.actions)

      get().setToast({
        response,
        options: {
          action: options.isCreate ? 'vaultCreate' : 'vault',
          accountId: options.accountId,
          changes: { deposits: depositedCoins },
        },
      })

      return response.then((response) => !!response.result)
    },
    withdraw: async (options: {
      accountId: string
      coins: Array<{ coin: BNCoin; isMax?: boolean }>
      borrow: BNCoin[]
      reclaims: ActionCoin[]
    }) => {
      const reclaimActions = options.reclaims.map((coin) => ({
        reclaim: coin,
      }))
      const withdrawActions = options.coins.map(({ coin, isMax }) => ({
        withdraw: coin.toActionCoin(isMax),
      }))
      const borrowActions = options.borrow.map((coin) => ({
        borrow: coin.toCoin(),
      }))

      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [...reclaimActions, ...borrowActions, ...withdrawActions],
        },
      }

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'withdraw',
          target: 'wallet',
          accountId: options.accountId,
          changes: { deposits: options.coins.map((coin) => coin.coin) },
        },
      })

      return response.then((response) => !!response.result)
    },
    repay: async (options: {
      accountId: string
      coin: BNCoin
      accountBalance?: boolean
      lend?: BNCoin
    }) => {
      const actions: Action[] = [
        {
          repay: {
            coin: options.coin.toActionCoin(options.accountBalance),
          },
        },
      ]

      if (options.lend && options.lend.amount.isGreaterThan(0))
        actions.unshift({ reclaim: options.lend.toActionCoin() })

      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions,
        },
      }

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'repay',
          accountId: options.accountId,
          changes: { deposits: [options.coin] },
        },
      })

      return response.then((response) => !!response.result)
    },
    lend: async (options: { accountId: string; coin: BNCoin; isMax?: boolean }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              lend: options.coin.toActionCoin(options.isMax),
            },
          ],
        },
      }

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'lend',
          accountId: options.accountId,
          changes: { lends: [options.coin] },
        },
      })

      return response.then((response) => !!response.result)
    },
    reclaim: async (options: { accountId: string; coin: BNCoin; isMax?: boolean }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              reclaim: options.coin.toActionCoin(options.isMax),
            },
          ],
        },
      }

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'withdraw',
          target: 'account',
          accountId: options.accountId,
          changes: { deposits: [options.coin] },
        },
      })

      return response.then((response) => !!response.result)
    },
    swap: (options: {
      accountId: string
      coinIn: BNCoin
      reclaim?: BNCoin
      borrow?: BNCoin
      denomOut: string
      slippage: number
      isMax?: boolean
    }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            ...(options.reclaim ? [{ reclaim: options.reclaim.toActionCoin() }] : []),
            ...(options.borrow ? [{ borrow: options.borrow.toCoin() }] : []),
            {
              swap_exact_in: {
                coin_in: options.coinIn.toActionCoin(options.isMax),
                denom_out: options.denomOut,
                slippage: options.slippage.toString(),
              },
            },
          ],
        },
      }

      if (
        checkAutoLendEnabled(options.accountId) &&
        getAssetByDenom(options.denomOut)?.isAutoLendEnabled
      ) {
        msg.update_credit_account.actions.push({
          lend: { denom: options.denomOut, amount: 'account_balance' },
        })
      }

      const messages = [
        generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, []),
      ]

      const estimateFee = () => getEstimatedFee(messages)

      const execute = async () => {
        const response = get().executeMsg({
          messages,
        })

        const swapOptions = { denomOut: options.denomOut, coinIn: options.coinIn }

        get().setToast({
          response,
          options: {
            action: 'swap',
            accountId: options.accountId,
          },
          swapOptions,
        })

        return response.then((response) => !!response.result)
      }

      return { estimateFee, execute }
    },
    updateOracle: async (pricesData: string[]) => {
      const msg: PythUpdateExecuteMsg = { update_price_feeds: { data: pricesData } }
      const pythAssets = getPythAssets()
      const response = get().executeMsg({
        messages: [
          generateExecutionMessage(get().address, ENV.ADDRESS_PYTH, msg, [
            { denom: get().baseCurrency.denom, amount: String(pythAssets.length) },
          ]),
        ],
      })

      get().setToast({
        response,
        options: {
          action: 'oracle',
          message: 'Oracle updated successfully!',
        },
      })

      return response.then((response) => !!response.result)
    },
    setToast: (toast: ToastObject) => {
      const id = moment().unix()
      set({
        toast: {
          id,
          promise: toast.response,
        },
      })

      toast.response.then((response) => {
        if (toast.options.action === 'create') {
          toast.options.accountId =
            getSingleValueFromBroadcastResult(response.result, 'wasm', 'token_id') ?? undefined
        }

        if (toast.options.action === 'swap' && toast.swapOptions) {
          const coinOut = getTokenOutFromSwapResponse(response, toast.swapOptions.denomOut)
          const successMessage = `Swapped ${formatAmountWithSymbol(
            toast.swapOptions.coinIn.toCoin(),
          )} for ${formatAmountWithSymbol(coinOut)}`
          toast.options.message = successMessage
        }

        handleResponseMessages({
          id,
          response,
          ...toast.options,
        })
      })
    },
    executeMsg: async (options: { messages: MsgExecuteContract[] }): Promise<BroadcastResult> => {
      try {
        const client = get().client
        if (!client) return { error: 'no client detected' }
        const fee = await getEstimatedFee(options.messages)
        const broadcastOptions = {
          messages: options.messages,
          feeAmount: fee.amount[0].amount,
          gasLimit: fee.gas,
          memo: undefined,
          wallet: client.connectedWallet,
          mobile: isMobile,
        }
        const result = await client.broadcast(broadcastOptions)
        if (result.hash) {
          return { result }
        }

        return {
          result: undefined,
          error: 'Transaction failed',
        }
      } catch (e: unknown) {
        const error = typeof e === 'string' ? e : 'Transaction failed'
        return { result: undefined, error }
      }
    },
  }
}
