import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import useWalletStore from 'stores/useWalletStore'
import { contractAddresses } from 'config/contracts'
import { hardcodedFee } from 'utils/contants'
import { queryKeys } from 'types/query-keys-factory'

const useCreateCreditAccount = (accountId: string) => {
  const signingClient = useWalletStore((s) => s.signingClient)
  const address = useWalletStore((s) => s.address)

  const queryClient = useQueryClient()

  return useMutation(
    async () =>
      await signingClient?.execute(
        address,
        contractAddresses.accountNft,
        {
          burn: {
            token_id: accountId,
          },
        },
        hardcodedFee
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(queryKeys.creditAccounts(address))
      },
      onError: (err: Error) => {
        toast.error(err.message)
      },
      onSuccess: () => {
        toast.success('Credit Account Deleted')
      },
    }
  )
}

export default useCreateCreditAccount
