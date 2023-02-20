import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

import { ADDRESS_INCENTIVES, ADDRESS_RED_BANK, ENV_MISSING_MESSAGE, GQL } from 'constants/env'
import { getMarketAssets } from 'utils/assets'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!GQL || !ADDRESS_RED_BANK || !ADDRESS_INCENTIVES) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const marketAssets = getMarketAssets()

  const marketQueries = marketAssets.map(
    (asset: Asset) =>
      `${asset.symbol}Market: contractQuery(
        contractAddress: "${ADDRESS_RED_BANK}"
        query: { market: { denom: "${asset.denom}" } }
      )
      ${asset.symbol}MarketIncentive: contractQuery(
        contractAddress: "${ADDRESS_INCENTIVES}"
        query: { asset_incentive: { denom: "${asset.denom}" } }
      )`,
  )

  const result = await gqlRequest<RedBankData>(
    GQL,
    gql`
      query RedbankQuery {
        rbwasmkey: wasm {
         ${marketQueries}
        }
      }
    `,
  )

  return res.status(200).json(result.rbwasmkey)
}

interface RedBankData {
  rbwasmkey: {
    OSMOMarket: Market
    OSMOMarketIncentive: MarketIncentive
    ATOMMarket: Market
    ATOMMarketIncentive: MarketIncentive
    JUNOMarket: Market
    JUNOMarketIncentive: MarketIncentive
    axlUSDCMarket: Market
    axlUSDCMarketIncentive: MarketIncentive
  }
}

interface MarketIncentive {
  denom: string
  emission_per_second: number
  index: number
  last_updated: number
}
