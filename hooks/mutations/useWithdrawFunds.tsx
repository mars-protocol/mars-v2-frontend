import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'react-toastify'
import BigNumber from 'bignumber.js'

import useWalletStore from 'stores/useWalletStore'
import { contractAddresses } from 'config/contracts'
import { hardcodedFee } from 'utils/contants'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import { queryKeys } from 'types/query-keys-factory'

const useWithdrawFunds = (
  amount: string | number,
  denom: string,
  options?: {
    onSuccess?: () => void
  }
) => {
  const signingClient = useWalletStore((s) => s.signingClient)
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const address = useWalletStore((s) => s.address)

  const queryClient = useQueryClient()

  const executeMsg = useMemo(() => {
    return {
      update_credit_account: {
        account_id: selectedAccount,
        actions: [
          {
            withdraw: {
              denom: denom,
              amount: BigNumber(amount)
                .times(10 ** 6)
                .toString(),
            },
          },
        ],
      },
    }
  }, [amount, denom, selectedAccount])

  const { onSuccess } = { ...options }

  return useMutation(
    async () =>
      await signingClient?.execute(
        address,
        contractAddresses.creditManager,
        executeMsg,
        hardcodedFee
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.creditAccountsPositions(selectedAccount ?? ''))
        queryClient.invalidateQueries(queryKeys.tokenBalance(address, denom))
        queryClient.invalidateQueries(queryKeys.allBalances(address))
        queryClient.invalidateQueries(queryKeys.redbankBalances())

        onSuccess && onSuccess()
      },
      onError: (err: Error) => {
        toast.error(err.message)
      },
    }
  )
}

export default useWithdrawFunds
