import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { useAccountDetailsStore } from 'store/useAccountDetailsStore'
import { useModalStore } from 'store/useModalStore'
import { useNetworkConfigStore } from 'store/useNetworkConfigStore'
import { useWalletStore } from 'stores/useWalletStore'
import { queryKeys } from 'types/query-keys-factory'
import { hardcodedFee } from 'utils/contants'

// 200000 gas used
const executeMsg = {
  create_credit_account: {},
}

export const useCreateCreditAccount = () => {
  const signingClient = useWalletStore((s) => s.signingClient)
  const address = useWalletStore((s) => s.address)
  const creditManagerAddress = useNetworkConfigStore((s) => s.contracts.creditManager)

  const queryClient = useQueryClient()

  return useMutation(
    async () =>
      await signingClient?.execute(address ?? '', creditManagerAddress, executeMsg, hardcodedFee),
    {
      onSettled: () => {
        queryClient.invalidateQueries(queryKeys.creditAccounts(address ?? ''))
      },
      onError: (err: Error) => {
        toast.error(err.message)
      },
      onSuccess: (data) => {
        if (!data) return

        // TODO: is there some better way to parse response to extract token id???
        const createdID = data.logs[0].events[2].attributes[6].value
        useAccountDetailsStore.setState({ selectedAccount: createdID })
        useModalStore.setState({ fundAccountModal: true })
      },
    },
  )
}
