import { getMarketAssets } from 'utils/assets'
import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const network = process.env.NEXT_PUBLIC_NETWORK

  const url = process.env.NEXT_PUBLIC_GQL
  const oracleAddress = process.env.NEXT_PUBLIC_ORACLE

  if (!network || !url || !oracleAddress) {
    return res.status(404).json({ message: 'Env variables missing' })
  }

  const marketAssets = getMarketAssets()

  const result = await gqlRequest<TokenPricesResult>(
    url,
    gql`
      query PriceOracle {
        prices: wasm {
          ${marketAssets.map((asset) => {
            return `${asset.symbol}: contractQuery(
              contractAddress: "${oracleAddress}"
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
