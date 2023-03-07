'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import useStore from 'store'
import { queryKeys } from 'types/query-keys-factory'

type Result = {
  tokens: string[]
}

export const useCreditAccounts = () => {
  if (!ENV.ADDRESS_ACCOUNT_NFT) {
    console.error(ENV_MISSING_MESSAGE)
    return null
  }

  const address = useStore((s) => s.address)
  const client = useStore((s) => s.signingClient)
  const selectedAccount = useStore((s) => s.selectedAccount)
  const accountNftAddress = ENV.ADDRESS_ACCOUNT_NFT
  const setSelectedAccount = (account: string) => {
    useStore.setState({ selectedAccount: account })
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
    async () => client?.queryContractSmart(accountNftAddress || '', queryMsg),
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
