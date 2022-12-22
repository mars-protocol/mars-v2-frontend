import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useNetworkConfigStore } from 'stores'
import { queryKeys } from 'types/query-keys-factory'

interface Result {
  data: {
    bank: {
      balance: Coin[]
    }
  }
}

const fetchBalances = async (hiveUrl: string, redBankAddress: string) => {
  return fetch(hiveUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
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
    }),
  }).then((res) => res.json())
}

export const useRedbankBalances = () => {
  const hiveUrl = useNetworkConfigStore((s) => s.hiveUrl)
  const redBankAddress = useNetworkConfigStore((s) => s.contracts.redBank)
  const result = useQuery<Result>(
    queryKeys.redbankBalances(),
    async () => await fetchBalances(hiveUrl, redBankAddress),
  )

  return {
    ...result,
    data: useMemo(() => {
      if (!result.data) return

      return result.data?.data.bank.balance.reduce(
        (acc, coin) => ({
          ...acc,
          [coin.denom]: coin.amount,
        }),
        {},
      ) as { [key in string]: string }
    }, [result.data]),
  }
}
