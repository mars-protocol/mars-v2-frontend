import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import BigNumber from 'bignumber.js'

import useWalletStore from 'stores/useWalletStore'
import { chain } from 'utils/chains'
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
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient>()

  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const address = useWalletStore((s) => s.address)

  const queryClient = useQueryClient()

  useEffect(() => {
    ;(async () => {
      if (!window.keplr) return

      const offlineSigner = window.keplr.getOfflineSigner(chain.chainId)
      const clientInstance = await SigningCosmWasmClient.connectWithSigner(chain.rpc, offlineSigner)

      setSigningClient(clientInstance)
    })()
  }, [address])

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
