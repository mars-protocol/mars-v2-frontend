import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { useMemo } from 'react'

import { ENV } from 'constants/env'
import useStore from 'store'
import { queryKeys } from 'types/query-keys-factory'

interface UserBalanceData {
  balance: {
    balance: Coin[]
  }
}

export const useAllBalances = () => {
  const address = useStore((s) => s.address)

  const result = useQuery<UserBalanceData>(
    queryKeys.allBalances(address ?? ''),
    async () => {
      return await request(
        ENV.URL_GQL!,
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
      enabled: !!address,
      staleTime: 30000,
      refetchInterval: 30000,
    },
  )
  return {
    ...result,
    data: useMemo(() => result.data && result.data.balance.balance, [result.data]),
  }
}
