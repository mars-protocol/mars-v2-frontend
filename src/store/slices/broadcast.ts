import { Coin, StdFee } from '@cosmjs/stargate'
import { MsgExecuteContract, TxBroadcastResult } from '@marsprotocol/wallet-connector'
import { isMobile } from 'react-device-detect'
import { GetState, SetState } from 'zustand'

import { ADDRESS_CREDIT_MANAGER, ENV_MISSING_MESSAGE } from 'constants/env'
import { Store } from 'store'
import { getMarketAssets } from 'utils/assets'
import { getSingleValueFromBroadcastResult } from 'utils/broadcast'
import { convertFromGwei } from 'utils/formatters'
import showToast from 'utils/toast'
import { getTokenSymbol } from 'utils/tokens'

interface BroadcastResult {
  result?: TxBroadcastResult
  error?: string
}

export interface BroadcastSlice {
  executeMsg: (options: {
    msg: Record<string, unknown>
    fee: StdFee
    funds?: Coin[]
  }) => Promise<BroadcastResult>
  createCreditAccount: (options: { fee: StdFee }) => Promise<string | null>
  deleteCreditAccount: (options: { fee: StdFee; accountId: string }) => Promise<boolean>
  depositCreditAccount: (options: {
    fee: StdFee
    accountId: string
    deposit: Coin
  }) => Promise<boolean>
}

export function createBroadcastSlice(set: SetState<Store>, get: GetState<Store>): BroadcastSlice {
  const marketAssets = getMarketAssets()
  return {
    createCreditAccount: async (options: { fee: StdFee }) => {
      const msg = {
        create_credit_account: {},
      }
      set({ createAccountModal: true })
      const response = await get().executeMsg({ msg, fee: options.fee })

      if (response.result) {
        set({ createAccountModal: false })
        const id = getSingleValueFromBroadcastResult(response.result, 'wasm', 'token_id')
        showToast(`Account ${id} created`)
        set({ fundAccountModal: true })
        return id
      } else {
        set({ createAccountModal: false })
        showToast(response.error ?? 'transaction failed', false)
        return null
      }
    },
    deleteCreditAccount: async (options: { fee: StdFee; accountId: string }) => {
      const msg = {
        burn: {
          token_id: options.accountId,
        },
      }
      set({ deleteAccountModal: true })
      const response = await get().executeMsg({ msg, fee: options.fee })

      set({ deleteAccountModal: false })
      if (response.result) {
        showToast(`Account ${options.accountId} deleted`)
      } else {
        showToast(response.error ?? 'transaction failed', false)
      }
      return !!response.result
    },
    depositCreditAccount: async (options: { fee: StdFee; accountId: string; deposit: Coin }) => {
      const deposit = {
        denom: options.deposit.denom,
        amount: String(options.deposit.amount),
      }
      const msg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              deposit: deposit,
            },
          ],
        },
      }
      const funds = [deposit]

      const response = await get().executeMsg({ msg, fee: options.fee, funds })
      if (response.result) {
        showToast(
          `Deposited ${convertFromGwei(
            deposit.amount,
            deposit.denom,
            marketAssets,
          )} ${getTokenSymbol(deposit.denom, marketAssets)} to Account ${options.accountId}`,
        )
      } else {
        showToast(response.error ?? 'transaction failed', false)
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
        if (!ADDRESS_CREDIT_MANAGER) return { error: ENV_MISSING_MESSAGE }
        if (!client) return { error: 'no client detected' }

        const broadcastOptions = {
          messages: [
            new MsgExecuteContract({
              sender: client.recentWallet.account.address,
              contract: ADDRESS_CREDIT_MANAGER,
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
        return { result: undefined, error: 'broadcast failed' }
      } catch (e: unknown) {
        const error = typeof e === 'string' ? e : 'broadcast failed'
        return { result: undefined, error }
      }
    },
  }
}
