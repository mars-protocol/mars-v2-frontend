import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'react-toastify'

import { useAccountDetailsStore, useWalletStore } from 'stores'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { queryKeys } from 'types/query-keys-factory'
import { hardcodedFee } from 'utils/contants'

const useTradeAsset = (
  amount: number,
  borrowAmount: number,
  depositAmount: number,
  tokenIn: string,
  tokenOut: string,
  slippage: number,
  options?: Omit<UseMutationOptions, 'onError'>,
) => {
  const creditManagerClient = useWalletStore((s) => s.clients.creditManager)
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount ?? '')

  const queryClient = useQueryClient()

  // actions need to be executed in order deposit -> borrow -> swap
  // first two are optional
  const actions = useMemo(() => {
    const actionsBase = [
      {
        swap_exact_in: {
          coin_in: { amount: String(amount), denom: tokenIn },
          denom_out: tokenOut,
          slippage: String(slippage),
        },
      },
    ] as Action[]

    if (borrowAmount > 0) {
      actionsBase.unshift({
        borrow: {
          denom: tokenIn,
          amount: String(borrowAmount),
        },
      })
    }

    if (depositAmount > 0) {
      actionsBase.unshift({
        deposit: {
          denom: tokenIn,
          amount: String(depositAmount),
        },
      })
    }

    return actionsBase
  }, [amount, tokenIn, tokenOut, slippage, borrowAmount, depositAmount])

  return useMutation(
    async () =>
      await creditManagerClient?.updateCreditAccount(
        { accountId: selectedAccount, actions },
        hardcodedFee,
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(queryKeys.creditAccountsPositions(selectedAccount))
        queryClient.invalidateQueries(queryKeys.redbankBalances())
      },
      onError: (err: Error) => {
        toast.error(err.message)
      },
      ...options,
    },
  )
}

export default useTradeAsset
