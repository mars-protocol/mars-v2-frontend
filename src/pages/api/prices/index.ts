import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'
import { Coin } from '@cosmjs/stargate'

import { ADDRESS_ORACLE, ENV_MISSING_MESSAGE, URL_GQL } from 'constants/env'
import { getMarketAssets } from 'utils/assets'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!URL_GQL || !ADDRESS_ORACLE) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const marketAssets = getMarketAssets()

  const result = await gqlRequest<TokenPricesResult>(
    URL_GQL,
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

  const data: Coin[] = Object.values(result?.prices).reduce((acc: Coin[], curr) => {
    return [...acc, { denom: curr.denom, amount: curr.price }] as Coin[]
  }, [])

  return res.status(200).json(data)
}
