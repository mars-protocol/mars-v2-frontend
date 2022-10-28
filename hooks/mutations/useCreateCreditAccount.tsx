import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import useWalletStore from 'stores/useWalletStore'
import { contractAddresses } from 'config/contracts'
import { hardcodedFee } from 'utils/contants'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import { queryKeys } from 'types/query-keys-factory'

// 200000 gas used
const executeMsg = {
  create_credit_account: {},
}

const useCreateCreditAccount = () => {
  const signingClient = useWalletStore((s) => s.signingClient)
  const setSelectedAccount = useCreditManagerStore((s) => s.actions.setSelectedAccount)
  const address = useWalletStore((s) => s.address)

  const queryClient = useQueryClient()

  return useMutation(
    async () =>
      await signingClient?.execute(
        address,
        contractAddresses.creditManager,
        executeMsg,
        hardcodedFee
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(queryKeys.creditAccounts(address))
      },
      onError: (err: Error) => {
        toast.error(err.message)
      },
      onSuccess: (data) => {
        if (!data) return

        // TODO: is there some better way to parse response to extract token id???
        const createdID = data.logs[0].events[2].attributes[6].value
        setSelectedAccount(createdID)
        toast.success('New account created')
      },
    }
  )
}

export default useCreateCreditAccount
