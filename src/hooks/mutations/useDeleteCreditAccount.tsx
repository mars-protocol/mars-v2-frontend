import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { ADDRESS_ACCOUNT_NFT } from 'constants/env'
import useStore from 'store'
import { queryKeys } from 'types/query-keys-factory'
import { hardcodedFee } from 'utils/contants'

export const useDeleteCreditAccount = (accountId: string) => {
  const signingClient = useStore((s) => s.signingClient)
  const address = useStore((s) => s.address)
  const accountNftAddress = ADDRESS_ACCOUNT_NFT

  const queryClient = useQueryClient()

  return useMutation(
    async () =>
      await signingClient?.execute(
        address ?? '',
        accountNftAddress || '',
        {
          burn: {
            token_id: accountId,
          },
        },
        hardcodedFee,
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(queryKeys.creditAccounts(address ?? ''))
      },
      onError: (err: Error) => {
        toast.error(err.message)
      },
      onSuccess: () => {
        toast.success('Credit Account Deleted')
      },
    },
  )
}
