import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Coin } from '@cosmjs/stargate'

import { contractAddresses } from 'config/contracts'

const HIVE_URL =
  'https://osmosis-delphi-testnet-1.simply-vc.com.mt/XF32UOOU55CX/osmosis-hive/graphql'

interface Result {
  data: {
    bank: {
      balance: Coin[]
    }
  }
}

const fetchBalances = () => {
  return fetch(HIVE_URL, {
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
  const result = useQuery<Result>(['redbankBalances'], fetchBalances)

  return {
    ...result,
    data: useMemo(() => {
      if (!result.data) return

      return result.data?.data.bank.balance.reduce(
        (acc, coin) => ({
          ...acc,
          [coin.denom]: coin.amount,
        }),
        {}
      ) as { [key in string]: string }
    }, [result.data]),
  }
}

export default useRedbankBalances
