import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { useMemo } from 'react'

import { ADDRESS_RED_BANK, URL_GQL } from 'constants/env'
import { queryKeys } from 'types/query-keys-factory'

interface Result {
  bank: {
    balance: Coin[]
  }
}

export const useRedbankBalances = () => {
  const redBankAddress = ADDRESS_RED_BANK
  const result = useQuery<Result>(
    queryKeys.redbankBalances(),
    async () => {
      return await request(
        URL_GQL!,
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
