import { toast } from 'react-toastify'
import useSWR from 'swr'

import { ADDRESS_ACCOUNT_NFT } from 'constants/env'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'

export const useDeleteCreditAccount = (accountId: string) => {
  const signingClient = useStore((s) => s.signingClient)
  const address = useStore((s) => s.address)
  const accountNftAddress = ADDRESS_ACCOUNT_NFT

  return useSWR(
    'qwef',
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
  )
}
