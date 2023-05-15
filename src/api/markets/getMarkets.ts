import { gql, request as gqlRequest } from 'graphql-request'

import { ENV } from 'constants/env'
import { getMarketAssets } from 'utils/assets'
import { denomToKey } from 'utils/query'
import { resolveMarketResponses } from 'utils/resolvers'

export default async function getMarkets(): Promise<Market[]> {
  const marketAssets = getMarketAssets()

  const marketQueries = marketAssets.map(
    (asset: Asset) =>
      `${denomToKey(asset.denom)}: contractQuery(
    contractAddress: "${ENV.ADDRESS_RED_BANK}"
        query: { market: { denom: "${asset.denom}" } }
      )`,
  )

  const result = await gqlRequest<RedBankData>(
    ENV.URL_GQL,
    gql`
      query RedbankQuery {
        rbwasmkey: wasm {
         ${marketQueries}
        }
      }
    `,
  )

  const markets = marketAssets.map((asset) => {
    const market = result.rbwasmkey[`${denomToKey(asset.denom)}`]
    return market
  })
  return resolveMarketResponses(markets)
}

interface RedBankData {
  rbwasmkey: {
    [key: string]: MarketResponse
  }
}
