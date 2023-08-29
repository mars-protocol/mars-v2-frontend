import { MsgExecuteContract } from '@delphi-labs/shuttle-react'
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
import { getAssetByDenom, getAssetBySymbol } from 'utils/assets'
import { getSingleValueFromBroadcastResult } from 'utils/broadcast'
import checkAutoLendEnabled from 'utils/checkAutoLendEnabled'
import { defaultFee } from 'utils/constants'
import { formatAmountWithSymbol } from 'utils/formatters'
import getTokenOutFromSwapResponse from 'utils/getTokenOutFromSwapResponse'
import { BN } from 'utils/helpers'

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
  const getEstimatedFee = async (messages: MsgExecuteContract[]) => {
    if (!get().client) {
      console.warn('Client not initialized')
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

      handleResponseMessages(
        response,
        `Borrowed ${formatAmountWithSymbol(options.coin.toCoin())} to ${
          options.borrowToWallet ? 'Wallet' : `Credit Account ${options.accountId}`
        }`,
      )
      return !!response.result
    },
    createAccount: async () => {
      const msg: CreditManagerExecuteMsg = {
        create_credit_account: 'default',
      }

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      if (response.result) {
        set({ createAccountModal: false })
        const id = getSingleValueFromBroadcastResult(response.result, 'wasm', 'token_id')
        set({ fundAccountModal: true, toast: { message: `Credit Account ${id} created` } })
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

      handleResponseMessages(response, `Credit Account ${options.accountId} deleted`)

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

        const successMessage = `Claimed rewards for, ${options.accountId}`

        handleResponseMessages(response, successMessage)
        return !!response.result
      }

      return { estimateFee, execute }
    },
    deposit: async (options: { accountId: string; coins: BNCoin[] }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.coins.map((coin) => ({
            deposit: coin.toCoin(),
          })),
        },
      }

      if (checkAutoLendEnabled(options.accountId)) {
        msg.update_credit_account.actions.push(
          ...options.coins
            .filter((coin) => getAssetByDenom(coin.denom)?.isAutoLendEnabled)
            .map((coin) => ({ lend: coin.toActionCoin(true) })),
        )
      }

      const funds = options.coins.map((coin) => coin.toCoin())

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, funds)],
      })

      const depositString = options.coins
        .map((coin) => formatAmountWithSymbol(coin.toCoin()))
        .join(' and ')
      handleResponseMessages(
        response,
        `Deposited ${depositString} to Credit Credit Account ${options.accountId}`,
      )
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

      handleResponseMessages(response, `Requested unlock for ${options.vault.name}`)
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
      handleResponseMessages(
        response,
        `You successfully withdrew ${options.vaults.length} unlocked ${vaultsString} to your account`,
      )
      return !!response.result
    },
    depositIntoVault: async (options: { accountId: string; actions: Action[] }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.actions,
        },
      }

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      handleResponseMessages(response, `Deposited into vault`)
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

      const withdrawString = options.coins
        .map(({ coin }) => formatAmountWithSymbol(coin.toCoin()))
        .join('and ')
      handleResponseMessages(
        response,
        `Withdrew ${withdrawString} from Credit Account ${options.accountId}`,
      )
      return !!response.result
    },
    repay: async (options: {
      accountId: string
      coin: BNCoin
      accountBalance?: boolean
      lends?: BNCoin
    }) => {
      const actions: Action[] = [
        {
          repay: {
            coin: options.coin.toActionCoin(options.accountBalance),
          },
        },
      ]

      if (options.lends && options.lends.amount.isGreaterThan(0))
        actions.unshift({ reclaim: options.lends.toActionCoin() })

      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions,
        },
      }

      const response = await get().executeMsg({
        messages: [generateExecutionMessage(get().address, ENV.ADDRESS_CREDIT_MANAGER, msg, [])],
      })

      handleResponseMessages(
        response,
        `Repayed ${formatAmountWithSymbol(options.coin.toCoin())} to Credit Account ${
          options.accountId
        }`,
      )
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

      handleResponseMessages(
        response,
        `Successfully deposited ${formatAmountWithSymbol(options.coin.toCoin())}`,
      )
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

      handleResponseMessages(
        response,
        `Successfully withdrew ${formatAmountWithSymbol(options.coin.toCoin())}`,
      )
      return !!response.result
    },
    swap: (options: {
      accountId: string
      coinIn: BNCoin
      borrow?: BNCoin
      denomOut: string
      slippage: number
      isMax?: boolean
    }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
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

        handleResponseMessages(response, successMessage)
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
