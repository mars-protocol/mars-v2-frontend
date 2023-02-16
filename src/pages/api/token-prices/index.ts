import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

import { networkConfig } from 'config/osmo-test-4'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const whitelistedAssets = networkConfig.assets.whitelist

  const result = await gqlRequest<TokenPricesResult>(
    'https://osmosis-delphi-testnet-1.simply-vc.com.mt/XF32UOOU55CX/osmosis-hive/graphql',
    gql`
      query PriceOracle {
        prices: wasm {
          ${whitelistedAssets.map((token) => {
            return `${token.symbol}: contractQuery(
              contractAddress: "osmo1hkkx42777dyfz7wc8acjjhfdh9x2ugcjvdt7shtft6ha9cn420cquz3u3j"
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

  const data = Object.values(result?.prices).reduce(
    (acc, entry) => ({
      ...acc,
      [entry.denom]: Number(entry.price),
    }),
    {},
  ) as { [key in string]: number }

  return res.status(200).json(data)
}
