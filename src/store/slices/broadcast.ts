import { MsgExecuteContract } from '@delphi-labs/shuttle-react'
import { isMobile } from 'react-device-detect'
import { GetState, SetState } from 'zustand'

import { ENV } from 'constants/env'
import { Store } from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { ExecuteMsg as AccountNftExecuteMsg } from 'types/generated/mars-account-nft/MarsAccountNft.types'
import {
  Action,
  Action as CreditManagerAction,
  ExecuteMsg as CreditManagerExecuteMsg,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getSingleValueFromBroadcastResult } from 'utils/broadcast'
import { formatAmountWithSymbol } from 'utils/formatters'
import getTokenOutFromSwapResponse from 'utils/getTokenOutFromSwapResponse'

function generateExecutionMessage(
  sender: string | undefined,
  contract: string,
  msg: CreditManagerExecuteMsg | AccountNftExecuteMsg,
  funds: Coin[],
) {
  if (!sender) return

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
    borrow: async (options: {
      fee: StdFee
      accountId: string
      coin: Coin
      borrowToWallet: boolean
    }) => {
      const borrowAction: Action = { borrow: options.coin }
      const withdrawAction: Action = { withdraw: options.coin }
      const actions = options.borrowToWallet ? [borrowAction, withdrawAction] : [borrowAction]

      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions,
        },
      }

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
        fee: options.fee,
      })

      handleResponseMessages(
        response,
        `Borrowed ${formatAmountWithSymbol(options.coin)} to ${
          options.borrowToWallet ? 'Wallet' : `Account ${options.accountId}`
        }`,
      )
      return !!response.result
    },
    createAccount: async (options: { fee: StdFee }) => {
      const msg: CreditManagerExecuteMsg = {
        create_credit_account: 'default',
      }

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
        fee: options.fee,
      })

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
    deleteAccount: async (options: { fee: StdFee; accountId: string; lends: BNCoin[] }) => {
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
        fee: options.fee,
      })

      handleResponseMessages(response, `Account ${options.accountId} deleted`)

      return !!response.result
    },
    deposit: async (options: { fee: StdFee; accountId: string; coins: BNCoin[] }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.coins.map((coin) => ({
            deposit: coin.toCoin(),
          })),
        },
      }

      const funds = options.coins.map((coin) => coin.toCoin())

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, funds)],
        fee: options.fee,
      })

      const depositString = options.coins
        .map((coin) => formatAmountWithSymbol(coin.toCoin()))
        .join('and ')
      handleResponseMessages(response, `Deposited ${depositString} to Account ${options.accountId}`)
      return !!response.result
    },
    unlock: async (options: {
      fee: StdFee
      accountId: string
      vault: DepositedVault
      amount: string
    }) => {
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
        fee: options.fee,
      })

      handleResponseMessages(response, `Requested unlock for ${options.vault.name}`)
      return !!response.result
    },

    withdrawFromVaults: async (options: {
      fee: StdFee
      accountId: string
      vaults: DepositedVault[]
    }) => {
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

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
        fee: options.fee,
      })

      const vaultsString = options.vaults.length === 1 ? 'vault' : 'vaults'
      handleResponseMessages(
        response,
        `You successfully withdrew ${options.vaults.length} unlocked ${vaultsString} to your account`,
      )
      return !!response.result
    },
    depositIntoVault: async (options: { fee: StdFee; accountId: string; actions: Action[] }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.actions,
        },
      }

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
        fee: options.fee,
      })

      handleResponseMessages(response, `Deposited into vault`)
      return !!response.result
    },
    withdraw: async (options: {
      fee: StdFee
      accountId: string
      coins: BNCoin[]
      borrow: BNCoin[]
    }) => {
      const withdrawActions = options.coins.map((coin) => ({
        withdraw: coin.toCoin(),
      }))
      const borrowActions = options.borrow.map((coin) => ({
        borrow: coin.toCoin(),
      }))

      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [...borrowActions, ...withdrawActions],
        },
      }

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
        fee: options.fee,
      })

      const withdrawString = options.coins
        .map((coin) => formatAmountWithSymbol(coin.toCoin()))
        .join('and ')
      handleResponseMessages(
        response,
        `Withdrew ${withdrawString} from Account ${options.accountId}`,
      )
      return !!response.result
    },
    repay: async (options: {
      fee: StdFee
      accountId: string
      coin: BNCoin
      accountBalance?: boolean
    }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              repay: {
                coin: options.coin.toActionCoin(options.accountBalance),
              },
            },
          ],
        },
      }

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
        fee: options.fee,
      })

      handleResponseMessages(
        response,
        `Repayed ${formatAmountWithSymbol(options.coin.toCoin())} to Account ${options.accountId}`,
      )
      return !!response.result
    },
    lend: async (options: { fee: StdFee; accountId: string; coin: BNCoin; isMax?: boolean }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              lend: options.coin.toCoin(),
            },
          ],
        },
      }

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
        fee: options.fee,
      })

      handleResponseMessages(
        response,
        `Successfully deposited ${formatAmountWithSymbol(options.coin.toCoin())}`,
      )
      return !!response.result
    },
    reclaim: async (options: { fee: StdFee; accountId: string; coin: BNCoin; isMax?: boolean }) => {
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
        fee: options.fee,
      })

      handleResponseMessages(
        response,
        `Successfully withdrew ${formatAmountWithSymbol(options.coin.toCoin())}`,
      )
      return !!response.result
    },
    swap: async (options: {
      fee: StdFee
      accountId: string
      coinIn: BNCoin
      denomOut: string
      slippage: number
    }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              swap_exact_in: {
                coin_in: options.coinIn.toActionCoin(),
                denom_out: options.denomOut,
                slippage: options.slippage.toString(),
              },
            },
          ],
        },
      }

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
        fee: options.fee,
      })

      const coinOut = getTokenOutFromSwapResponse(response, options.denomOut)
      const successMessage = `Swapped ${formatAmountWithSymbol(
        options.coinIn.toCoin(),
      )} for ${formatAmountWithSymbol(coinOut)}`

      handleResponseMessages(response, successMessage)
      return !!response.result
    },
    executeMsg: async (options: {
      messages: MsgExecuteContract[]
      fee: StdFee
    }): Promise<BroadcastResult> => {
      try {
        const client = get().client
        if (!client) return { error: 'no client detected' }

        const broadcastOptions = {
          messages: options.messages,
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
