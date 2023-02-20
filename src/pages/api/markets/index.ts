import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

import { getMarketAssets } from 'utils/assets'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const network = process.env.NEXT_PUBLIC_NETWORK
  const url = process.env.NEXT_PUBLIC_GQL
  const redBankAddress = process.env.NEXT_PUBLIC_RED_BANK
  const incentivesAddress = process.env.NEXT_PUBLIC_INCENTIVES

  if (!url || !redBankAddress || !incentivesAddress || !network) {
    return res.status(404).json({ message: 'Env variables missing' })
  }

  const marketAssets = getMarketAssets()

  const marketQueries = marketAssets.map(
    (asset: Asset) =>
      `${asset.symbol}Market: contractQuery(
        contractAddress: "${redBankAddress}"
        query: { market: { denom: "${asset.denom}" } }
      )
      ${asset.symbol}MarketIncentive: contractQuery(
        contractAddress: "${incentivesAddress}"
        query: { asset_incentive: { denom: "${asset.denom}" } }
      )`,
  )

  const result = await gqlRequest<RedBankData>(
    url,
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
