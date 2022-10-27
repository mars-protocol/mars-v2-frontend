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

const useBorrowFunds = (
  amount: string | number,
  denom: string,
  withdraw = false,
  options: Omit<UseMutationOptions, 'onError'>
) => {
  const signingClient = useWalletStore((s) => s.signingClient)
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const address = useWalletStore((s) => s.address)

  const queryClient = useQueryClient()

  const executeMsg = useMemo(() => {
    const tokenDecimals = getTokenDecimals(denom)

    if (!withdraw) {
      return {
        update_credit_account: {
          account_id: selectedAccount,
          actions: [
            {
              borrow: {
                denom: denom,
                amount: BigNumber(amount)
                  .times(10 ** tokenDecimals)
                  .toString(),
              },
            },
          ],
        },
      }
    }

    return {
      update_credit_account: {
        account_id: selectedAccount,
        actions: [
          {
            borrow: {
              denom: denom,
              amount: BigNumber(amount)
                .times(10 ** tokenDecimals)
                .toString(),
            },
          },
          {
            withdraw: {
              denom: denom,
              amount: BigNumber(amount)
                .times(10 ** tokenDecimals)
                .toString(),
            },
          },
        ],
      },
    }
  }, [withdraw, selectedAccount, denom, amount])

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
        queryClient.invalidateQueries(queryKeys.creditAccountsPositions(selectedAccount ?? ''))
        queryClient.invalidateQueries(queryKeys.redbankBalances())

        // if withdrawing to wallet, need to explicility invalidate balances queries
        if (withdraw) {
          queryClient.invalidateQueries(queryKeys.tokenBalance(address, denom))
          queryClient.invalidateQueries(queryKeys.allBalances(address))
        }
      },
      onError: (err: Error) => {
        toast.error(err.message)
      },
      ...options,
    }
  )
}

export default useBorrowFunds
