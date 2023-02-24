import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'react-toastify'

import useStore from 'store'
import { queryKeys } from 'types/query-keys-factory'
import { hardcodedFee } from 'utils/contants'
import showToast from 'utils/toast'

export const useWithdrawFunds = (
  amount: number,
  borrowAmount: number,
  denom: string,
  options?: {
    onSuccess?: () => void
  },
) => {
  const selectedAccount = useStore((s) => s.selectedAccount ?? '')
  const address = useStore((s) => s.address)
  const creditManagerClient = useStore((s) => s.clients.creditManager)
  const queryClient = useQueryClient()
  const actions = useMemo(() => {
    if (borrowAmount > 0) {
      return [
        {
          borrow: {
            denom,
            amount: String(borrowAmount),
          },
        },
        {
          withdraw: {
            denom,
            amount: String(amount),
          },
        },
      ]
    }
    return [
      {
        withdraw: {
          denom,
          amount: String(amount),
        },
      },
    ]
  }, [amount, borrowAmount, denom])
  const { onSuccess } = { ...options }
  return useMutation(
    async () =>
      creditManagerClient?.updateCreditAccount(
        { accountId: selectedAccount, actions },
        hardcodedFee,
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.creditAccountsPositions(selectedAccount))
        queryClient.invalidateQueries(queryKeys.tokenBalance(address ?? '', denom))
        queryClient.invalidateQueries(queryKeys.allBalances(address ?? ''))
        queryClient.invalidateQueries(queryKeys.redbankBalances())
        onSuccess && onSuccess()
      },
      onError: (err: Error) => {
        showToast(err.message, false)
      },
    },
  )
}
