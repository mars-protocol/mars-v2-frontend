import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'react-toastify'

import { useAccountDetailsStore, useWalletStore } from 'stores'
import { queryKeys } from 'types/query-keys-factory'
import { hardcodedFee } from 'utils/contants'

export const useBorrowFunds = (
  amount: number,
  denom: string,
  withdraw = false,
  options: Omit<UseMutationOptions, 'onError'>,
) => {
  const creditManagerClient = useWalletStore((s) => s.clients.creditManager)
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount ?? '')
  const address = useWalletStore((s) => s.address)

  const queryClient = useQueryClient()

  const actions = useMemo(() => {
    if (!withdraw) {
      return [
        {
          borrow: {
            denom: denom,
            amount: String(amount),
          },
        },
      ]
    }

    return [
      {
        borrow: {
          denom: denom,
          amount: String(amount),
        },
      },
      {
        withdraw: {
          denom: denom,
          amount: String(amount),
        },
      },
    ]
  }, [withdraw, denom, amount])

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

        // if withdrawing to wallet, need to explicility invalidate balances queries
        if (withdraw) {
          queryClient.invalidateQueries(queryKeys.tokenBalance(address ?? '', denom))
          queryClient.invalidateQueries(queryKeys.allBalances(address ?? ''))
        }
      },
      onError: (err: Error) => {
        toast.error(err.message)
      },
      ...options,
    },
  )
}
