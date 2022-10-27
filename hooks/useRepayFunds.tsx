import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'react-toastify'
import BigNumber from 'bignumber.js'

import useWalletStore from 'stores/useWalletStore'
import { contractAddresses } from 'config/contracts'
import { hardcodedFee } from 'utils/contants'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import { queryKeys } from 'types/query-keys-factory'
import { getTokenDecimals } from 'utils/tokens'

// 0.001% buffer / slippage to avoid repay action from not fully repaying the debt amount
const REPAY_BUFFER = 1.00001

const useRepayFunds = (
  amount: string | number,
  denom: string,
  options: Omit<UseMutationOptions, 'onError'>
) => {
  const signingClient = useWalletStore((s) => s.signingClient)
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const address = useWalletStore((s) => s.address)

  const queryClient = useQueryClient()

  const amountWithDecimals = BigNumber(amount)
    .times(10 ** getTokenDecimals(denom))
    .times(REPAY_BUFFER)
    .decimalPlaces(0)
    .toString()

  const executeMsg = useMemo(() => {
    return {
      update_credit_account: {
        account_id: selectedAccount,
        actions: [
          {
            deposit: {
              denom: denom,
              amount: amountWithDecimals,
            },
          },
          {
            repay: {
              denom: denom,
              amount: amountWithDecimals,
            },
          },
        ],
      },
    }
  }, [amountWithDecimals, denom, selectedAccount])

  return useMutation(
    async () =>
      await signingClient?.execute(
        address,
        contractAddresses.creditManager,
        executeMsg,
        hardcodedFee,
        undefined,
        [
          {
            denom,
            amount: amountWithDecimals,
          },
        ]
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(queryKeys.creditAccountsPositions(selectedAccount ?? ''))
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
