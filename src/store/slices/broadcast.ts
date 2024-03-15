import { MsgExecuteContract } from '@delphi-labs/shuttle-react'
import BigNumber from 'bignumber.js'
import moment from 'moment'
import { isMobile } from 'react-device-detect'
import { StoreApi } from 'zustand'

import getPythPriceData from 'api/prices/getPythPriceData'
import { BN_ZERO } from 'constants/math'
import { Store } from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { ExecuteMsg as AccountNftExecuteMsg } from 'types/generated/mars-account-nft/MarsAccountNft.types'
import {
  Action,
  ActionCoin,
  Action as CreditManagerAction,
  ExecuteMsg as CreditManagerExecuteMsg,
  ExecuteMsg,
  SwapperRoute,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { ExecuteMsg as IncentivesExecuteMsg } from 'types/generated/mars-incentives/MarsIncentives.types'
import { ExecuteMsg as RedBankExecuteMsg } from 'types/generated/mars-red-bank/MarsRedBank.types'
import { AccountKind } from 'types/generated/mars-rover-health-types/MarsRoverHealthTypes.types'
import { byDenom, bySymbol } from 'utils/array'
import { generateErrorMessage, getSingleValueFromBroadcastResult } from 'utils/broadcast'
import checkAutoLendEnabled from 'utils/checkAutoLendEnabled'
import checkPythUpdateEnabled from 'utils/checkPythUpdateEnabled'
import { defaultFee } from 'utils/constants'
import { formatAmountWithSymbol } from 'utils/formatters'
import getTokenOutFromSwapResponse from 'utils/getTokenOutFromSwapResponse'
import { BN } from 'utils/helpers'
import { getVaultDepositCoinsFromActions } from 'utils/vaults'

function generateExecutionMessage(
  sender: string | undefined = '',
  contract: string,
  msg:
    | CreditManagerExecuteMsg
    | AccountNftExecuteMsg
    | RedBankExecuteMsg
    | PythUpdateExecuteMsg
    | IncentivesExecuteMsg,
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
  set: StoreApi<Store>['setState'],
  get: StoreApi<Store>['getState'],
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

      case 'open-perp':
        toast.content.push({
          coins: changes.deposits?.map((deposit) => deposit.toCoin()) ?? [],
          text: 'Market order executed',
        })
        break
      case 'close-perp':
        // TODO: [Perps] Elaborate on the message
        toast.content.push({
          coins: [],
          text: 'Closed perp position',
        })
        break
      case 'modify-perp':
        toast.content.push({
          coins: [],
          text: 'Modified perp position',
        })
        break

      case 'swap':
        if (changes.debts) {
          toast.content.push({
            coins: [changes.debts[0].toCoin()],
            text: 'Borrowed',
          })
        }
        if (changes.reclaims) {
          toast.content.push({
            coins: [changes.reclaims[0].toCoin()],
            text: 'Unlent',
          })
        }
        if (changes.swap) {
          toast.content.push({
            coins: [changes.swap.from, changes.swap.to],
            text: 'Swapped',
          })
        }
        if (changes.repays) {
          toast.content.push({
            coins: [changes.repays[0].toCoin()],
            text: 'Repaid',
          })
        }
        break

      case 'vault':
      case 'vaultCreate':
        toast.content.push({
          coins: changes.deposits?.map((debt) => debt.toCoin()) ?? [],
          text: action === 'vaultCreate' ? 'Created a Vault Position' : 'Added to Vault Position',
        })
        break
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
        const { success } = simulateResult
        if (success) {
          const fee = simulateResult.fee
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
    addToStakingStrategy: async (options: {
      accountId: string
      actions: Action[]
      depositCoin: BNCoin
      borrowCoin: BNCoin
    }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.actions,
        },
      }

      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [
          generateExecutionMessage(get().address, cmContract, msg, [options.depositCoin.toCoin()]),
        ],
      })

      const swapOptions = { denomOut: options.depositCoin.denom, coinIn: options.borrowCoin }

      get().setToast({
        response,

        options: {
          action: 'hls-staking',
          accountId: options.accountId,
          changes: { deposits: [options.depositCoin], debts: [options.borrowCoin] },
        },
        swapOptions,
      })

      return response.then((response) => !!response.result)
    },
    execute: async (contract: string, msg: ExecuteMsg, funds: Coin[]) => {
      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, contract, msg, funds)],
      })

      get().setToast({
        response,
        options: { action: 'deposit', message: `Executed message` },
      })

      return response
    },
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
        checkAutoLendEnabled(options.accountId, get().chainConfig.id) &&
        get().chainConfig.assets.find(byDenom(options.coin.denom))?.isAutoLendEnabled
      ) {
        msg.update_credit_account.actions.push({
          lend: { denom: options.coin.denom, amount: 'account_balance' },
        })
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'borrow',
          lend: checkAutoLendEnabled(options.accountId, get().chainConfig.id),
          target: options.borrowToWallet ? 'wallet' : 'account',
          accountId: options.accountId,
          changes: { debts: [options.coin] },
        },
      })

      return response.then((response) => !!response.result)
    },
    changeHlsStakingLeverage: async (options: { accountId: string; actions: Action[] }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.actions,
        },
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'deposit',
          message: `Changed Leverage`,
        },
      })

      return response.then((response) => !!response.result)
    },
    closeHlsStakingPosition: async (options: { accountId: string; actions: Action[] }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.actions,
        },
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'deposit',
          message: `Exited HLS strategy`,
        },
      })

      return response.then((response) => !!response.result)
    },

    createAccount: async (accountKind: AccountKind) => {
      const msg: CreditManagerExecuteMsg = {
        create_credit_account: accountKind,
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
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
      const cmContract = get().chainConfig.contracts.creditManager
      const nftContract = get().chainConfig.contracts.accountNft

      const response = get().executeMsg({
        messages: [
          generateExecutionMessage(get().address, cmContract, refundMessage, []),
          generateExecutionMessage(get().address, nftContract, burnMessage, []),
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
      const isV1 = get().isV1
      const creditManagerMsg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              claim_rewards: {},
            },
          ],
        },
      }

      const incentivesMsg: IncentivesExecuteMsg = {
        claim_rewards: {},
      }
      const contract = isV1
        ? get().chainConfig.contracts.incentives
        : get().chainConfig.contracts.creditManager

      const messages = [
        generateExecutionMessage(
          get().address,
          contract,
          isV1 ? incentivesMsg : creditManagerMsg,
          [],
        ),
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
            accountId: isV1 ? get().address : options.accountId,
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
            .filter((coin) => get().chainConfig.assets.find(byDenom(coin.denom))?.isAutoLendEnabled)
            .map((coin) => ({ lend: coin.toActionCoin(options.lend) })),
        )
      }

      const funds = options.coins.map((coin) => coin.toCoin())
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, funds)],
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
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
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

      if (checkAutoLendEnabled(options.accountId, get().chainConfig.id)) {
        for (const vault of options.vaults) {
          for (const symbol of Object.values(vault.symbols)) {
            const asset = get().chainConfig.assets.find(bySymbol(symbol))
            if (asset?.isAutoLendEnabled) {
              msg.update_credit_account.actions.push({
                lend: { denom: asset.denom, amount: 'account_balance' },
              })
            }
          }
        }
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
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
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [
          generateExecutionMessage(
            get().address,
            cmContract,
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
      const cmContract = get().chainConfig.contracts.creditManager

      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [...reclaimActions, ...borrowActions, ...withdrawActions],
        },
      }

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
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
      fromWallet?: boolean
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

      const msg: CreditManagerExecuteMsg = options.fromWallet
        ? {
            repay_from_wallet: {
              account_id: options.accountId,
            },
          }
        : {
            update_credit_account: {
              account_id: options.accountId,
              actions,
            },
          }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [
          generateExecutionMessage(
            get().address,
            cmContract,
            msg,
            options.fromWallet ? [options.coin.toCoin()] : [],
          ),
        ],
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
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
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
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
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
      repay: boolean
      route: SwapperRoute
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
                route: options.route as SwapperRoute,
              },
            },
            ...(options.repay
              ? [
                  {
                    repay: {
                      coin: BNCoin.fromDenomAndBigNumber(options.denomOut, BN_ZERO).toActionCoin(
                        true,
                      ),
                    },
                  },
                ]
              : []),
          ],
        },
      }

      if (
        checkAutoLendEnabled(options.accountId, get().chainConfig.id) &&
        get().chainConfig.assets.find(byDenom(options.denomOut))?.isAutoLendEnabled &&
        !options.repay
      ) {
        msg.update_credit_account.actions.push({
          lend: { denom: options.denomOut, amount: 'account_balance' },
        })
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const messages = [generateExecutionMessage(get().address, cmContract, msg, [])]

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
            changes: {
              reclaims: options.reclaim ? [options.reclaim] : undefined,
              debts: options.borrow ? [options.borrow] : undefined,
            },
            repay: options.repay,
          },
          swapOptions,
        })

        return response.then((response) => !!response.result)
      }

      return { estimateFee, execute }
    },
    updateOracle: async () => {
      const response = get().executeMsg({
        messages: [],
        isPythUpdate: true,
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
        mobileNavExpanded: false,
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

        if (toast.swapOptions) {
          const coinOut = getTokenOutFromSwapResponse(response, toast.swapOptions.denomOut)

          if (toast.options.action === 'swap') {
            if (!toast.options.changes) toast.options.changes = {}
            toast.options.changes.swap = {
              from: toast.swapOptions.coinIn.toCoin(),
              to: getTokenOutFromSwapResponse(response, toast.swapOptions.denomOut),
            }
            if (toast.options.repay) toast.options.changes.repays = [BNCoin.fromCoin(coinOut)]
          }

          if (toast.options.action === 'hls-staking') {
            const depositAmount: BigNumber = toast.options.changes?.deposits?.length
              ? toast.options.changes.deposits[0].amount
              : BN_ZERO

            coinOut.amount = depositAmount.plus(coinOut.amount).toFixed(0)
            toast.options.message = `Added ${formatAmountWithSymbol(
              coinOut,
              get().chainConfig.assets,
            )}`
          }
        }

        handleResponseMessages({
          id,
          response,
          ...toast.options,
        })
      })
    },
    executeMsg: async (options: {
      messages: MsgExecuteContract[]
      isPythUpdate?: boolean
    }): Promise<BroadcastResult> => {
      try {
        const client = get().client
        const isLedger = client?.connectedWallet?.account.isLedger
        if (!client)
          return { result: undefined, error: 'No client detected. Please reconnect your wallet.' }
        if ((checkPythUpdateEnabled() || options.isPythUpdate) && !isLedger) {
          const pythUpdateMsg = await get().getPythVaas()
          options.messages.unshift(pythUpdateMsg)
        }
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
      } catch (error) {
        const e = error as { message: string }
        console.log(e)
        return { result: undefined, error: e.message }
      }
    },
    openPerpPosition: async (options: { accountId: string; coin: BNCoin }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              open_perp: options.coin.toSignedCoin(),
            },
          ],
        },
      }

      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'open-perp',
          target: 'account',
          accountId: options.accountId,
          changes: { deposits: [options.coin] },
        },
      })

      return response.then((response) => !!response.result)
    },
    closePerpPosition: async (options: { accountId: string; denom: string }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              close_perp: { denom: options.denom },
            },
          ],
        },
      }

      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'close-perp',
          target: 'account',
          accountId: options.accountId,
          changes: { deposits: [] },
        },
      })

      return response.then((response) => !!response.result)
    },
    modifyPerpPosition: async (options: {
      accountId: string
      coin: BNCoin
      changeDirection: boolean
    }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            ...(options.changeDirection
              ? [
                  {
                    close_perp: {
                      denom: options.coin.denom,
                    },
                  },
                  {
                    open_perp: options.coin.toSignedCoin(),
                  },
                ]
              : [
                  {
                    modify_perp: {
                      denom: options.coin.denom,
                      new_size: options.coin.amount.toString() as any,
                    },
                  },
                ]),
          ],
        },
      }

      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().setToast({
        response,
        options: {
          action: 'modify-perp',
          target: 'account',
          message: `Modified position to a ${formatAmountWithSymbol(options.coin.abs().toCoin(), get().chainConfig.assets)} ${options.coin.amount.isNegative() ? 'short' : 'long'}`,
          accountId: options.accountId,
          changes: { deposits: [options.coin] },
        },
      })

      return response.then((response) => !!response.result)
    },
    getPythVaas: async () => {
      const priceFeedIds = get()
        .chainConfig.assets.filter((asset) => !!asset.pythPriceFeedId)
        .map((asset) => asset.pythPriceFeedId as string)
      const pricesData = await getPythPriceData(priceFeedIds)
      const msg: PythUpdateExecuteMsg = { update_price_feeds: { data: pricesData } }
      const pythAssets = get().chainConfig.assets.filter((asset) => !!asset.pythPriceFeedId)
      const pythContract = get().chainConfig.contracts.pyth

      return generateExecutionMessage(get().address, pythContract, msg, [
        { denom: get().chainConfig.assets[0].denom, amount: String(pythAssets.length) },
      ])
    },
    v1Action: async (type: V1ActionType, coin: BNCoin) => {
      let msg: RedBankExecuteMsg
      let toastOptions: ToastObjectOptions = {
        action: type,
        accountId: get().address,
        changes: {},
      }
      let funds: Coin[] = []

      switch (type) {
        case 'withdraw':
          msg = {
            withdraw: {
              amount: coin.amount.toString(),
              denom: coin.denom,
            },
          }
          toastOptions = {
            ...toastOptions,
            changes: { deposits: [coin] },
            target: 'wallet',
          }
          break
        case 'repay':
          msg = {
            repay: {},
          }
          toastOptions.changes = { deposits: [coin] }
          funds = [coin.toCoin()]
          break
        case 'borrow':
          msg = {
            borrow: {
              amount: coin.amount.toString(),
              denom: coin.denom,
            },
          }
          toastOptions = {
            ...toastOptions,
            changes: { debts: [coin] },
            target: 'wallet',
          }
          break
        default:
          msg = {
            deposit: {},
          }
          toastOptions.changes = { deposits: [coin] }
          funds = [coin.toCoin()]
      }

      const redBankContract = get().chainConfig.contracts.redBank

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, redBankContract, msg, funds)],
      })

      get().setToast({
        response,
        options: toastOptions,
      })

      return response.then((response) => !!response.result)
    },
  }
}
