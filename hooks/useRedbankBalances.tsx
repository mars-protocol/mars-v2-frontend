import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import { contractAddresses } from 'config/contracts'
import { useMemo } from 'react'
import { queryKeys } from 'types/query-keys-factory'
import { chain } from 'utils/chains'

interface Result {
  data: {
    bank: {
      balance: Coin[]
    }
  }
}

const fetchBalances = () => {
  return fetch(chain.hive, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
      query RedbankBalances {
        bank {
                balance(
                    address: "${contractAddresses.redBank}"
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

const useRedbankBalances = () => {
  const result = useQuery<Result>(queryKeys.redbankBalances(), fetchBalances)

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

export default useRedbankBalances
