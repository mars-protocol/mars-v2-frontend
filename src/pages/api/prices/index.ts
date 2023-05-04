import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import { getMarketAssets } from 'utils/assets'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENV.URL_GQL || !ENV.ADDRESS_ORACLE) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const marketAssets = getMarketAssets()

  const result = await gqlRequest<TokenPricesResult>(
    ENV.URL_GQL,
    gql`
      query PriceOracle {
        prices: wasm {
          ${marketAssets.map((asset) => {
            return `${asset.id}: contractQuery(
              contractAddress: "${ENV.ADDRESS_ORACLE}"
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

  const data: Coin[] = Object.values(result?.prices).reduce((acc: Coin[], curr) => {
    return [...acc, { denom: curr.denom, amount: curr.price }] as Coin[]
  }, [])

  return res.status(200).json(data)
}

interface TokenPricesResult {
  prices: {
    [key: string]: {
      denom: string
      price: string
    }
  }
}
