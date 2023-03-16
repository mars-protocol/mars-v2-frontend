import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

import { ENV, ENV_MISSING_MESSAGE, VERCEL_BYPASS } from 'constants/env'
import { denomToKey, getContractQuery, keyToDenom } from 'utils/query'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENV.URL_RPC || !ENV.ADDRESS_RED_BANK || !ENV.URL_GQL || !ENV.URL_API) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const markets = await (await fetch(`${ENV.URL_API}/markets${VERCEL_BYPASS}`)).json()

  let query = ''

  markets.forEach((asset: any) => {
    query += getContractQuery(
      denomToKey(asset.denom),
      ENV.ADDRESS_RED_BANK || '',
      `
    {
      underlying_liquidity_amount: {
        denom: "${asset.denom}"
        amount_scaled: "${asset.collateral_total_scaled}"
      }
    }`,
    )
  })

  const result = await gqlRequest<DepositsQuery>(
    ENV.URL_GQL,
    gql`
    query RedbankBalances {
        deposits: wasm {
            ${query}
        }
      }
    `,
  )

  if (result) {
    const deposits = Object.keys(result.deposits).map((key) => {
      return {
        denom: keyToDenom(key),
        amount: result.deposits[key],
      }
    })
    return res.status(200).json(deposits)
  }

  return res.status(404)
}

interface DepositsQuery {
  deposits: {
    [key: string]: string
  }
}
