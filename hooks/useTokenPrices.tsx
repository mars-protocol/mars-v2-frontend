import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { contractAddresses } from 'config/contracts'
import { queryKeys } from 'types/query-keys-factory'
import { chain } from 'utils/chains'

interface Result {
  data: {
    prices: {
      [key: string]: {
        denom: string
        price: string
      }
    }
  }
}

// TODO: build gql query dynamically on whitelisted tokens
const fetchTokenPrices = () => {
  return fetch(chain.hive, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
      query PriceOracle {
        prices: wasm {
          uosmo: contractQuery(
            contractAddress: "${contractAddresses.oracle}"
            query: {
              price: {
                denom: "uosmo"
              }
            }
          )
          atom: contractQuery(
            contractAddress: "${contractAddresses.oracle}"
            query: {
              price: {
                denom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
              }
            }
          )
          cro: contractQuery(
            contractAddress: "${contractAddresses.oracle}"
            query: {
              price: {
                denom: "ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1"
              }
            }
          )       
        }
      }
      `,
    }),
  }).then((res) => res.json())
}

const useTokenPrices = () => {
  const result = useQuery<Result>(queryKeys.tokenPrices(), fetchTokenPrices, {
    refetchInterval: 30000,
    staleTime: Infinity,
  })

  return {
    ...result,
    data: useMemo(() => {
      if (!result.data) return

      return Object.values(result.data?.data.prices).reduce(
        (acc, entry) => ({
          ...acc,
          [entry.denom]: Number(entry.price),
        }),
        {},
      ) as { [key in string]: number }
    }, [result.data]),
  }
}

export default useTokenPrices
