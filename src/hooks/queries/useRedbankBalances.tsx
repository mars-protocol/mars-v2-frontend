import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { useMemo } from 'react'

import { ENV } from 'constants/env'
import { queryKeys } from 'types/query-keys-factory'

interface Result {
  bank: {
    balance: Coin[]
  }
}

export const useRedbankBalances = () => {
  const redBankAddress = ENV.ADDRESS_RED_BANK
  const result = useQuery<Result>(
    queryKeys.redbankBalances(),
    async () => {
      return await request(
        ENV.URL_GQL!,
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
      enabled: !!redBankAddress,
      staleTime: 30000,
      refetchInterval: 30000,
    },
  )

  return {
    ...result,
    data: useMemo(() => result.data && result.data.bank.balance, [result.data]),
  }
}
