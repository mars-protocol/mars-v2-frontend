import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { useNetworkConfigStore, useWalletStore } from 'stores'
import { queryKeys } from 'types/query-keys-factory'
import { hardcodedFee } from 'utils/contants'

export const useDepositCreditAccount = (
  accountId: string,
  denom: string,
  amount: number,
  options?: {
    onSuccess?: () => void
  },
) => {
  const signingClient = useWalletStore((s) => s.signingClient)
  const address = useWalletStore((s) => s.address)
  const creditManagerAddress = useNetworkConfigStore((s) => s.contracts.creditManager)

  const queryClient = useQueryClient()

  return useMutation(
    async () =>
      await signingClient?.execute(
        address ?? '',
        creditManagerAddress,
        {
          update_credit_account: {
            account_id: accountId,
            actions: [
              {
                deposit: {
                  denom,
                  amount: String(amount),
                },
              },
            ],
          },
        },
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
      onError: (err: Error) => {
        toast.error(err.message)
      },
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.allBalances(address ?? ''))
        queryClient.invalidateQueries(queryKeys.tokenBalance(address ?? '', denom))
        queryClient.invalidateQueries(queryKeys.creditAccountsPositions(accountId))

        options?.onSuccess && options.onSuccess()
      },
    },
  )
}
