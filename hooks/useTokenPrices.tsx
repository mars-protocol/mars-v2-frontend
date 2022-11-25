import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { gql, request } from 'graphql-request'

import { contractAddresses } from 'config/contracts'
import { queryKeys } from 'types/query-keys-factory'
import { chain } from 'utils/chains'
import tokenInfo from 'config/tokenInfo'

interface Result {
  prices: {
    [key: string]: {
      denom: string
      price: string
    }
  }
}

const tokenInfoList = Object.values(tokenInfo)

// TODO: build gql query dynamically on whitelisted tokens
const fetchTokenPrices = () => {
  return request(
    chain.hive,
    gql`
      query PriceOracle {
        prices: wasm {
          ${tokenInfoList.map((token) => {
            return `${token.symbol}: contractQuery(
              contractAddress: "${contractAddresses.oracle}"
              query: {
                price: {
                  denom: "${token.denom}"
                }
              }
            )`
          })}   
        }
      }
      `,
  )
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

      return Object.values(result.data?.prices).reduce(
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
