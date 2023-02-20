import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

import { ADDRESS_ORACLE, ENV_MISSING_MESSAGE, GQL } from 'constants/env'
import { getMarketAssets } from 'utils/assets'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!GQL || !ADDRESS_ORACLE) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const marketAssets = getMarketAssets()

  const result = await gqlRequest<TokenPricesResult>(
    GQL,
    gql`
      query PriceOracle {
        prices: wasm {
          ${marketAssets.map((asset) => {
            return `${asset.symbol}: contractQuery(
              contractAddress: "${ADDRESS_ORACLE}"
              query: {
                price: {
                  denom: "${asset.denom}"
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
