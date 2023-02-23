import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

import { ADDRESS_INCENTIVES, ADDRESS_RED_BANK, ENV_MISSING_MESSAGE, URL_GQL } from 'constants/env'
import { getMarketAssets } from 'utils/assets'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!URL_GQL || !ADDRESS_RED_BANK || !ADDRESS_INCENTIVES) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const marketAssets = getMarketAssets()

  const marketQueries = marketAssets.map(
    (asset: Asset) =>
      `${asset.denom}: contractQuery(
        contractAddress: "${ADDRESS_RED_BANK}"
        query: { market: { denom: "${asset.denom}" } }
      )`,
  )

  const result = await gqlRequest<RedBankData>(
    URL_GQL,
    gql`
      query RedbankQuery {
        rbwasmkey: wasm {
         ${marketQueries}
        }
      }
    `,
  )

  const markets = marketAssets.map((asset) => {
    const market = result.rbwasmkey[`${asset.denom}`]
    return market
  })
  return res.status(200).json(markets)
}

interface RedBankData {
  rbwasmkey: {
    [key: string]: Market
  }
}
