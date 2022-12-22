import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import { useMemo } from 'react'

import { useNetworkConfigStore } from 'stores'
import { queryKeys } from 'types/query-keys-factory'

const fetchTokenPrices = async (
  hiveUrl: string,
  whitelistedTokens: Asset[],
  oracleAddress: string,
) => {
  return request(
    hiveUrl,
    gql`
      query PriceOracle {
        prices: wasm {
          ${whitelistedTokens.map((token) => {
            return `${token.symbol}: contractQuery(
              contractAddress: "${oracleAddress}"
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

export const useTokenPrices = () => {
  const hiveUrl = useNetworkConfigStore((s) => s.hiveUrl)
  const whitelistedTokens = useNetworkConfigStore((s) => s.assets.whitelist)
  const oracleAddress = useNetworkConfigStore((s) => s.contracts.oracle)
  const result = useQuery<TokenPricesResult>(
    queryKeys.tokenPrices(),
    async () => await fetchTokenPrices(hiveUrl, whitelistedTokens, oracleAddress),
    {
      refetchInterval: 30000,
      staleTime: Infinity,
    },
  )

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
