import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { useMemo } from 'react'

import { useNetworkConfigStore, useWalletStore } from 'stores'
import { queryKeys } from 'types/query-keys-factory'

interface UserBalanceData {
  balance: {
    balance: Coin[]
  }
}

export const useAllBalances = () => {
  const address = useWalletStore((s) => s.address)
  const hiveUrl = useNetworkConfigStore((s) => s.hiveUrl)

  const result = useQuery<UserBalanceData>(
    queryKeys.allBalances(address ?? ''),
    async () => {
      return await request(
        hiveUrl!,
        gql`
          query UserBalanceQuery {
                  balance: bank {
                      balance(
                          address: "${address}"
                      ) {
                          amount
                          denom
                      }
                  }
          }
      `,
      )
    },
    {
      enabled: !!hiveUrl && !!address,
      staleTime: 30000,
      refetchInterval: 30000,
    },
  )
  return {
    ...result,
    data: useMemo(() => result.data && result.data.balance.balance, [result.data]),
  }
}
