import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'react-toastify'

import useCreditManagerStore from 'stores/useCreditManagerStore'
import useWalletStore from 'stores/useWalletStore'
import { queryKeys } from 'types/query-keys-factory'
import { hardcodedFee } from 'utils/contants'

const useTradeAsset = (
  amount: number,
  denom: string,
  denomOut: string,
  slippage: number,
  options?: Omit<UseMutationOptions, 'onError'>,
) => {
  const creditManagerClient = useWalletStore((s) => s.clients.creditManager)
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount ?? '')
  const address = useWalletStore((s) => s.address)

  const queryClient = useQueryClient()

  const actions = useMemo(() => {
    return [
      {
        swap_exact_in: {
          coin_in: { amount: String(amount), denom },
          denom_out: denomOut,
          slippage: String(slippage),
        },
      },
    ]
  }, [amount, denom, denomOut, slippage])

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

        // // if withdrawing to wallet, need to explicility invalidate balances queries
        // if (withdraw) {
        //   queryClient.invalidateQueries(queryKeys.tokenBalance(address, denom))
        //   queryClient.invalidateQueries(queryKeys.allBalances(address))
        // }
      },
      onError: (err: Error) => {
        toast.error(err.message)
      },
      ...options,
    },
  )
}

export default useTradeAsset
