import { Coin, StdFee } from '@cosmjs/stargate'
import { MsgExecuteContract, TxBroadcastResult } from '@marsprotocol/wallet-connector'
import { isMobile } from 'react-device-detect'
import { GetState, SetState } from 'zustand'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import { Store } from 'store'
import { getMarketAssets } from 'utils/assets'
import { getSingleValueFromBroadcastResult } from 'utils/broadcast'
import { formatAmountWithSymbol } from 'utils/formatters'

interface BroadcastResult {
  result?: TxBroadcastResult
  error?: string
}

export interface BroadcastSlice {
  toast: { message: string; isError?: boolean } | null
  executeMsg: (options: {
    msg: Record<string, unknown>
    fee: StdFee
    funds?: Coin[]
  }) => Promise<BroadcastResult>
  borrow: (options: { fee: StdFee; accountId: string; coin: Coin }) => Promise<void>
  createAccount: (options: { fee: StdFee }) => Promise<string | null>
  deleteAccount: (options: { fee: StdFee; accountId: string }) => Promise<boolean>
  deposit: (options: { fee: StdFee; accountId: string; coin: Coin }) => Promise<boolean>
  repay: (options: {
    fee: StdFee
    accountId: string
    coin: Coin
    accountBalance?: boolean
  }) => Promise<boolean>
}

export function createBroadcastSlice(set: SetState<Store>, get: GetState<Store>): BroadcastSlice {
  const marketAssets = getMarketAssets()
  return {
    toast: null,
    borrow: async (options: { fee: StdFee; accountId: string; coin: Coin }) => {
      const msg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [{ borrow: options.coin }],
        },
      }

      const response = await get().executeMsg({ msg, fee: options.fee })

      if (response.result?.response.code === 0) {
        set({
          toast: {
            message: `Borrowed ${formatAmountWithSymbol(options.coin)} to Account ${
              options.accountId
            }`,
          },
        })
      } else {
        const error = response.error ? response.error : response.result?.rawLogs
        set({
          toast: {
            message: `Transaction failed: ${error}`,
            isError: true,
          },
        })
      }
    },
    createAccount: async (options: { fee: StdFee }) => {
      const msg = {
        create_credit_account: {},
      }
      set({ createAccountModal: true })
      const response = await get().executeMsg({ msg, fee: options.fee })

      if (response.result) {
        set({ createAccountModal: false })
        const id = getSingleValueFromBroadcastResult(response.result, 'wasm', 'token_id')
        set({ fundAccountModal: true, toast: { message: `Account #${id} created` } })
        return id
      } else {
        set({
          createAccountModal: false,
          toast: {
            message: response.error ?? `Transaction failed: ${response.error}`,
            isError: true,
          },
        })
        return null
      }
    },
    deleteAccount: async (options: { fee: StdFee; accountId: string }) => {
      const msg = {
        burn: {
          token_id: options.accountId,
        },
      }
      set({ deleteAccountModal: true })
      const response = await get().executeMsg({ msg, fee: options.fee })

      set({ deleteAccountModal: false })
      if (response.result) {
        set({ toast: { message: `Account #${options.accountId} deleted` } })
      } else {
        set({
          toast: {
            message: response.error ?? `Transaction failed: ${response.error}`,
            isError: true,
          },
        })
      }
      return !!response.result
    },
    deposit: async (options: { fee: StdFee; accountId: string; coin: Coin }) => {
      const msg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              deposit: options.coin,
            },
          ],
        },
      }

      const response = await get().executeMsg({ msg, fee: options.fee, funds: [options.coin] })
      if (response.result) {
        set({
          toast: {
            message: `Deposited ${formatAmountWithSymbol(options.coin)} to Account ${
              options.accountId
            }`,
          },
        })
      } else {
        set({
          toast: {
            message: response.error ?? `Transaction failed: ${response.error}`,
            isError: true,
          },
        })
      }
      return !!response.result
    },
    executeMsg: async (options: {
      fee: StdFee
      msg: Record<string, unknown>
      funds?: Coin[]
    }): Promise<BroadcastResult> => {
      const funds = options.funds ?? []

      try {
        const client = get().client
        if (!ENV.ADDRESS_CREDIT_MANAGER) return { error: ENV_MISSING_MESSAGE() }
        if (!client) return { error: 'no client detected' }

        const broadcastOptions = {
          messages: [
            new MsgExecuteContract({
              sender: client.recentWallet.account.address,
              contract: ENV.ADDRESS_CREDIT_MANAGER,
              msg: options.msg,
              funds,
            }),
          ],
          feeAmount: options.fee.amount[0].amount,
          gasLimit: options.fee.gas,
          memo: undefined,
          wallet: client.recentWallet,
          mobile: isMobile,
        }

        const result = await client.broadcast(broadcastOptions)

        if (result.hash) {
          return { result }
        }
        return { result: undefined, error: 'Transaction failed' }
      } catch (e: unknown) {
        const error = typeof e === 'string' ? e : 'Transaction failed'
        return { result: undefined, error }
      }
    },
    repay: async (options: {
      fee: StdFee
      accountId: string
      coin: Coin
      accountBalance?: boolean
    }) => {
      const msg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              repay: {
                denom: options.coin.denom,
                amount: options.accountBalance ? 'account_balance' : { exact: options.coin.amount },
              },
            },
          ],
        },
      }

      const response = await get().executeMsg({ msg, fee: options.fee, funds: [] })
      if (response.result?.response.code === 0) {
        set({
          toast: {
            message: `Repayed ${formatAmountWithSymbol(options.coin)} to Account ${
              options.accountId
            }`,
          },
        })
      } else {
        set({
          toast: {
            message: response.error ?? `Transaction failed: ${response.error}`,
            isError: true,
          },
        })
      }
      return !!response.result
    },
  }
}
