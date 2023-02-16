import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { useMemo } from 'react'

import { useNetworkConfigStore } from 'stores/useNetworkConfigStore'
import { queryKeys } from 'types/query-keys-factory'

interface Result {
  bank: {
    balance: Coin[]
  }
}

export const useRedbankBalances = () => {
  const hiveUrl = useNetworkConfigStore((s) => s.hiveUrl)
  const redBankAddress = useNetworkConfigStore((s) => s.contracts.redBank)
  const result = useQuery<Result>(
    queryKeys.redbankBalances(),
    async () => {
      return await request(
        hiveUrl!,
        gql`
          query RedbankBalances {
            bank {
                    balance(
                        address: "${redBankAddress}"
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
      enabled: !!hiveUrl && !!redBankAddress,
      staleTime: 30000,
      refetchInterval: 30000,
    },
  )

  return {
    ...result,
    data: useMemo(() => result.data && result.data.bank.balance, [result.data]),
  }
}
