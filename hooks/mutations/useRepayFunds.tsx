import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'react-toastify'

import useWalletStore from 'stores/useWalletStore'
import { contractAddresses } from 'config/contracts'
import { hardcodedFee } from 'utils/contants'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import { queryKeys } from 'types/query-keys-factory'

const useRepayFunds = (
  amount: number,
  denom: string,
  options: Omit<UseMutationOptions, 'onError'>
) => {
  const creditManagerClient = useWalletStore((s) => s.clients.creditManager)
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount ?? '')
  const address = useWalletStore((s) => s.address)

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
          amount: String(amount),
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
        ]
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(queryKeys.creditAccountsPositions(selectedAccount))
        queryClient.invalidateQueries(queryKeys.tokenBalance(address, denom))
        queryClient.invalidateQueries(queryKeys.allBalances(address))
        queryClient.invalidateQueries(queryKeys.redbankBalances())
      },
      onError: (err: Error) => {
        toast.error(err.message)
      },
      ...options,
    }
  )
}

export default useRepayFunds
