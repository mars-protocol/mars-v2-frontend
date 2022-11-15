import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'react-toastify'

import useCreditManagerStore from 'stores/useCreditManagerStore'
import useWalletStore from 'stores/useWalletStore'
import { queryKeys } from 'types/query-keys-factory'
import { hardcodedFee } from 'utils/contants'

const useTradeAsset = (
  amount: number,
  borrowAmount: number,
  tokenIn: string,
  tokenOut: string,
  slippage: number,
  options?: Omit<UseMutationOptions, 'onError'>,
) => {
  const creditManagerClient = useWalletStore((s) => s.clients.creditManager)
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount ?? '')

  const queryClient = useQueryClient()

  const actions = useMemo(() => {
    if (borrowAmount > 0) {
      return [
        {
          borrow: {
            denom: tokenIn,
            amount: String(borrowAmount),
          },
        },
        {
          swap_exact_in: {
            coin_in: { amount: String(amount), denom: tokenIn },
            denom_out: tokenOut,
            slippage: String(slippage),
          },
        },
      ]
    }

    return [
      {
        swap_exact_in: {
          coin_in: { amount: String(amount), denom: tokenIn },
          denom_out: tokenOut,
          slippage: String(slippage),
        },
      },
    ]
  }, [borrowAmount, amount, tokenIn, tokenOut, slippage])

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
