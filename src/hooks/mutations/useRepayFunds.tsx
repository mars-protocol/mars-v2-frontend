import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import useStore from 'store'
import { queryKeys } from 'types/query-keys-factory'
import { hardcodedFee } from 'utils/contants'

export const useRepayFunds = (
  amount: number,
  denom: string,
  options: Omit<UseMutationOptions, 'onError'>,
) => {
  const creditManagerClient = useStore((s) => s.clients.creditManager)
  const selectedAccount = useStore((s) => s.selectedAccount ?? '')
  const address = useStore((s) => s.address)
  const queryClient = useQueryClient()
  const actions = useMemo(() => {
    return [
      {
        deposit: {
          denom: denom,
          amount: String(amount),
        },
      },
      {
        repay: {
          denom: denom,
          amount: {
            exact: String(amount),
          },
        },
      },
    ]
  }, [amount, denom])
  return useMutation(
    async () =>
      await creditManagerClient?.updateCreditAccount(
        { accountId: selectedAccount, actions },
        hardcodedFee,
        undefined,
        [
          {
            denom,
            amount: String(amount),
          },
        ],
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(queryKeys.creditAccountsPositions(selectedAccount))
        queryClient.invalidateQueries(queryKeys.tokenBalance(address ?? '', denom))
        queryClient.invalidateQueries(queryKeys.allBalances(address ?? ''))
        queryClient.invalidateQueries(queryKeys.redbankBalances())
      },
      onError: (err: Error) => {
        useStore.setState({
          toast: { message: err.message, isError: true },
        })
      },
      ...options,
    },
  )
}
