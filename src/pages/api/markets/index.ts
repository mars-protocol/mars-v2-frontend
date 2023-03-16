import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import { getMarketAssets } from 'utils/assets'
import { denomToKey } from 'utils/query'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENV.URL_GQL || !ENV.ADDRESS_RED_BANK || !ENV.ADDRESS_INCENTIVES) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

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
  return res.status(200).json(markets)
}

interface RedBankData {
  rbwasmkey: {
    [key: string]: Market
  }
}
