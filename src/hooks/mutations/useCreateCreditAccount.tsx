import { toast } from 'react-toastify'
import useSWR from 'swr'

import { ADDRESS_CREDIT_MANAGER } from 'constants/env'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'
import { queryKeys } from 'types/query-keys-factory'

// 200000 gas used
const executeMsg = {
  create_credit_account: {},
}

export const useCreateCreditAccount = () => {
  const signingClient = useStore((s) => s.signingClient)
  const address = useStore((s) => s.address)
  const creditManagerAddress = ADDRESS_CREDIT_MANAGER

  return useSWR(
    'qklwfj',
    async () =>
      await signingClient?.execute(
        address ?? '',
        creditManagerAddress || '',
        executeMsg,
        hardcodedFee,
      ),
  )
}
