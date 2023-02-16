import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

import { networkConfig } from 'config/osmo-test-4'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const whitelistedAssets = networkConfig.assets.whitelist

  const marketQueries = whitelistedAssets.map(
    (asset: Asset) =>
      `${asset.symbol}Market: contractQuery(
        contractAddress: "osmo1t0dl6r27phqetfu0geaxrng0u9zn8qgrdwztapt5xr32adtwptaq6vwg36"
        query: { market: { denom: "${asset.denom}" } }
      )
      ${asset.symbol}MarketIncentive: contractQuery(
        contractAddress: "osmo1zxs8fry3m8j94pqg7h4muunyx86en27cl0xgk76fc839xg2qnn6qtpjs48"
        query: { asset_incentive: { denom: "${asset.denom}" } }
      )`,
  )

  const result = await gqlRequest<RedBankData>(
    'https://osmosis-delphi-testnet-1.simply-vc.com.mt/XF32UOOU55CX/osmosis-hive/graphql',
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
