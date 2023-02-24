import { NextApiRequest, NextApiResponse } from 'next'

import { ADDRESS_RED_BANK, ENV_MISSING_MESSAGE, URL_API, URL_GQL, URL_RPC } from 'constants/env'
import { gql, request as gqlRequest } from 'graphql-request'

import { getContractQuery } from 'utils/query'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!URL_RPC || !ADDRESS_RED_BANK || !URL_GQL || !URL_API) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const markets = await (await fetch(`${URL_API}/markets`)).json()

  let query = ''

  markets.forEach((asset: any) => {
    query += getContractQuery(
      asset.denom,
      ADDRESS_RED_BANK || '',
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
    URL_GQL,
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
        denom: key,
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
