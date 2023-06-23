import { MsgExecuteContract } from '@marsprotocol/wallet-connector'
import { isMobile } from 'react-device-detect'
import { GetState, SetState } from 'zustand'

import { ENV } from 'constants/env'
import { Store } from 'store'
import { getSingleValueFromBroadcastResult } from 'utils/broadcast'
import { formatAmountWithSymbol } from 'utils/formatters'
import AccountBalanceSettableCoin from 'types/classes/AccountBalanceSettableCoin'

export default function createBroadcastSlice(
  set: SetState<Store>,
  get: GetState<Store>,
): BroadcastSlice {
  const handleResponseMessages = (
    response: BroadcastResult,
    successMessage: string,
    errorMessage?: string,
  ) => {
    if (response.result?.response.code === 0) {
      set({
        toast: {
          message: successMessage,
        },
      })
    } else {
      const error = response.error ? response.error : response.result?.rawLogs
      set({
        toast: {
          message: errorMessage ?? `Transaction failed: ${error}`,
          isError: true,
        },
      })
    }
  }

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

      handleResponseMessages(
        response,
        `Borrowed ${formatAmountWithSymbol(options.coin)} to Account ${options.accountId}`,
      )
      return !!response.result
    },
    createAccount: async (options: { fee: StdFee }) => {
      const msg = {
        create_credit_account: 'default',
      }
      set({ createAccountModal: true })
      const response = await get().executeMsg({ msg, fee: options.fee })

      if (response.result) {
        set({ createAccountModal: false })
        const id = getSingleValueFromBroadcastResult(response.result, 'wasm', 'token_id')
        set({ fundAccountModal: true, toast: { message: `Account ${id} created` } })
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

      handleResponseMessages(response, `Account ${options.accountId} deleted`)

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

      handleResponseMessages(
        response,
        `Deposited ${formatAmountWithSymbol(options.coin)} to Account ${options.accountId}`,
      )
      return !!response.result
    },
    unlock: async (options: { fee: StdFee; vault: Vault; amount: string }) => {
      const msg = {
        request_vault_unlock: {
          vault: { address: options.vault.address },
          amount: options.amount,
        },
      }

      const response = await get().executeMsg({
        msg,
        fee: options.fee,
        funds: [],
      })

      handleResponseMessages(response, `Requested unlock for ${options.vault.name}`)
      return !!response.result
    },
    withdraw: async (options: { fee: StdFee; accountId: string; coin: Coin }) => {
      const msg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              withdraw: options.coin,
            },
          ],
        },
      }

      const response = await get().executeMsg({ msg, fee: options.fee })

      handleResponseMessages(
        response,
        `Withdrew ${formatAmountWithSymbol(options.coin)} from Account ${options.accountId}`,
      )
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
        if (!client) return { error: 'no client detected' }

        const broadcastOptions = {
          messages: [
            new MsgExecuteContract({
              sender: client.connectedWallet.account.address,
              contract: ENV.ADDRESS_CREDIT_MANAGER,
              msg: options.msg,
              funds,
            }),
          ],
          feeAmount: options.fee.amount[0].amount,
          gasLimit: options.fee.gas,
          memo: undefined,
          wallet: client.connectedWallet,
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

      handleResponseMessages(
        response,
        `Repayed ${formatAmountWithSymbol(options.coin)} to Account ${options.accountId}`,
      )
      return !!response.result
    },
    lend: async (options: { fee: StdFee; accountId: string; coin: AccountBalanceSettableCoin }) => {
      const msg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              lend: options.coin,
            },
          ],
        },
      }

      const response = await get().executeMsg({ msg, fee: options.fee })

      handleResponseMessages(
        response,
        `Successfully deposited ${formatAmountWithSymbol(options.coin)}`,
      )
      return !!response.result
    },
    reclaim: async (options: {
      fee: StdFee
      accountId: string
      coin: AccountBalanceSettableCoin
    }) => {
      const msg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              reclaim: options.coin.toActionCoin(),
            },
          ],
        },
      }

      const response = await get().executeMsg({ msg, fee: options.fee })

      handleResponseMessages(
        response,
        `Successfully withdrew ${formatAmountWithSymbol(options.coin)}`,
      )
      return !!response.result
    },
  }
}
