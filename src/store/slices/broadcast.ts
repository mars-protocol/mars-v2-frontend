import { MsgExecuteContract } from '@delphi-labs/shuttle-react'
import { isMobile } from 'react-device-detect'
import { GetState, SetState } from 'zustand'
import moment from 'moment'

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
import { getAssetByDenom, getAssetBySymbol } from 'utils/assets'
import { generateErrorMessage, getSingleValueFromBroadcastResult } from 'utils/broadcast'
import checkAutoLendEnabled from 'utils/checkAutoLendEnabled'
import { defaultFee } from 'utils/constants'
import { formatAmountWithSymbol } from 'utils/formatters'
import getTokenOutFromSwapResponse from 'utils/getTokenOutFromSwapResponse'
import { BN } from 'utils/helpers'

interface HandleResponse {
  response: BroadcastResult
  action:
    | 'deposit'
    | 'withdraw'
    | 'borrow'
    | 'repay'
    | 'vault'
    | 'lend'
    | 'create'
    | 'delete'
    | 'claim'
    | 'unlock'
    | 'swap'
  lend?: boolean
  accountId?: string
  changes?: { debts?: BNCoin[]; deposits?: BNCoin[]; lends?: BNCoin[] }
  target?: 'wallet' | 'account'
  message?: string
}

function generateExecutionMessage(
  sender: string | undefined = '',
  contract: string,
  msg: CreditManagerExecuteMsg | AccountNftExecuteMsg,
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
  const handleResponseMessages = (props: HandleResponse) => {
    const { accountId, response, action, lend, changes, target, message } = props

    if (response.error || response.result?.response.code !== 0) {
      set({
        toast: {
          message: generateErrorMessage(response),
          isError: true,
          hash: response.result?.hash,
        },
      })
      return
    }

    const toast: ToastResponse = {
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
        const action = lend ? 'Borrowed and lend' : 'Borrowed'
        toast.content.push({
          coins: borrowCoin,
          text: target === 'wallet' ? 'Borrowed to wallet' : action,
        })
        break

      case 'withdraw':
        toast.content.push({
          coins: changes.deposits?.map((deposit) => deposit.toCoin()) ?? [],
          text: target === 'wallet' ? 'Withdrew to Wallet' : 'Withdrew from lend',
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
          text: 'Repayed',
        })
        break

      case 'vault':
        toast.message = 'Created a Vault Position'
        toast.content.push({
          coins: changes.debts?.map((debt) => debt.toCoin()) ?? [],
          text: 'Borrowed for the Vault Position',
        })
        toast.content.push({
          coins: changes.deposits?.map((deposit) => deposit.toCoin()) ?? [],
          text: 'Withdrew for the Vault Position',
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

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      handleResponseMessages({
        response,
        action: 'borrow',
        lend: checkAutoLendEnabled(options.accountId),
        target: options.borrowToWallet ? 'wallet' : 'account',
        accountId: options.accountId,
        changes: { debts: [options.coin] },
      })

      return !!response.result
    },
    createAccount: async () => {
      const msg: CreditManagerExecuteMsg = {
        create_credit_account: 'default',
      }

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      set({ createAccountModal: false })
      const id = response.result
        ? getSingleValueFromBroadcastResult(response.result, 'wasm', 'token_id')
        : null

      handleResponseMessages({
        response,
        action: 'create',
        accountId: id ?? undefined,
        message: id ? `Created the Credit Account` : undefined,
      })

      if (id)
        set({
          fundAccountModal: true,
        })

      return id
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

      const response = await get().executeMsg({
        messages: [
          generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, refundMessage, []),
          generateExecutionMessage(get().address, ENV.ADDRESS_ACCOUNT_NFT, burnMessage, []),
        ],
      })

      handleResponseMessages({
        response,
        action: 'delete',
        accountId: options.accountId,
        message: `Deleted the Credit Account`,
      })

      return !!response.result
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
        const response = await get().executeMsg({
          messages,
        })

        handleResponseMessages({
          response,
          action: 'create',
          accountId: options.accountId,
          message: `Claimed rewards`,
        })

        return !!response.result
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

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, funds)],
      })

      handleResponseMessages({
        response,
        action: 'deposit',
        lend: options.lend,
        accountId: options.accountId,
        changes: { deposits: options.coins },
      })

      return !!response.result
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

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      handleResponseMessages({
        response,
        action: 'unlock',
        accountId: options.accountId,
        message: `Requested unlock for ${options.vault.name}`,
      })
      return !!response.result
    },

    withdrawFromVaults: async (options: { accountId: string; vaults: DepositedVault[] }) => {
      const actions: CreditManagerAction[] = []
      options.vaults.forEach((vault) => {
        if (vault.unlockId)
          actions.push({
            exit_vault_unlocked: {
              id: vault.unlockId,
              vault: { address: vault.address },
            },
          })
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

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      const vaultsString = options.vaults.length === 1 ? 'vault' : 'vaults'
      handleResponseMessages({
        response,
        action: 'withdraw',
        accountId: options.accountId,
        message: `Withdrew ${options.vaults.length} unlocked ${vaultsString} to the account`,
      })
      return !!response.result
    },
    depositIntoVault: async (options: {
      accountId: string
      actions: Action[]
      deposits: BNCoin[]
      borrowings: BNCoin[]
    }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.actions,
        },
      }

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      handleResponseMessages({
        response,
        action: 'vault',
        accountId: options.accountId,
        changes: { deposits: options.deposits, debts: options.borrowings },
      })

      return !!response.result
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

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      handleResponseMessages({
        response,
        action: 'withdraw',
        target: 'wallet',
        accountId: options.accountId,
        changes: { deposits: options.coins.map((coin) => coin.coin) },
      })

      return !!response.result
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

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      handleResponseMessages({
        response,
        action: 'repay',
        accountId: options.accountId,
        changes: { deposits: [options.coin] },
      })

      return !!response.result
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

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      handleResponseMessages({
        response,
        action: 'lend',
        accountId: options.accountId,
        changes: { lends: [options.coin] },
      })

      return !!response.result
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

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      handleResponseMessages({
        response,
        action: 'withdraw',
        target: 'account',
        accountId: options.accountId,
        changes: { deposits: [options.coin] },
      })

      return !!response.result
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
        const response = await get().executeMsg({
          messages,
        })

        const coinOut = getTokenOutFromSwapResponse(response, options.denomOut)
        const successMessage = `Swapped ${formatAmountWithSymbol(
          options.coinIn.toCoin(),
        )} for ${formatAmountWithSymbol(coinOut)}`

        handleResponseMessages({
          response,
          action: 'swap',
          message: successMessage,
          accountId: options.accountId,
        })
        return !!response.result
      }

      return { estimateFee, execute }
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
