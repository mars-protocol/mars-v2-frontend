import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import { useMemo } from 'react'

import { ADDRESS_ORACLE, URL_GQL } from 'constants/env'
import { queryKeys } from 'types/query-keys-factory'
import { getMarketAssets } from 'utils/assets'

const fetchTokenPrices = async (
  hiveUrl: string,
  marketAssets: Asset[],
  oracleAddress: string,
): Promise<TokenPricesResult> => {
  return request(
    hiveUrl,
    gql`
      query PriceOracle {
        prices: wasm {
          ${marketAssets.map((token) => {
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
  const marketAssets = getMarketAssets()
  const result = useQuery<TokenPricesResult>(
    queryKeys.tokenPrices(),
    async () => await fetchTokenPrices(URL_GQL!, marketAssets, ADDRESS_ORACLE || ''),
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
