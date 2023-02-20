'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useAccountDetailsStore } from 'store/useAccountDetailsStore'
import { useNetworkConfigStore } from 'store/useNetworkConfigStore'
import { useWalletStore } from 'stores/useWalletStore'
import { queryKeys } from 'types/query-keys-factory'

type Result = {
  tokens: string[]
}

export const useCreditAccounts = () => {
  const address = useWalletStore((s) => s.address)
  const client = useWalletStore((s) => s.signingClient)
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)
  const accountNftAddress = useNetworkConfigStore((s) => s.contracts.accountNft)
  const setSelectedAccount = (account: string) => {
    useAccountDetailsStore.setState({ selectedAccount: account })
  }

  const queryMsg = useMemo(() => {
    return {
      tokens: {
        owner: address,
      },
    }
  }, [address])

  const result = useQuery<Result>(
    queryKeys.creditAccounts(address ?? ''),
    async () => client?.queryContractSmart(accountNftAddress, queryMsg),
    {
      staleTime: Infinity,
      enabled: !!address && !!client,
      onSuccess: (data) => {
        if (!data.tokens.includes(selectedAccount || '') && data.tokens.length > 0) {
          setSelectedAccount(data.tokens[0])
        }
      },
    },
  )

  return {
    ...result,
    data: useMemo(() => {
      if (!address) return []

      return result?.data && result.data.tokens
    }, [address, result?.data]),
  }
}
