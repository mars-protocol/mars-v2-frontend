import { NextApiRequest, NextApiResponse } from 'next'

import { ADDRESS_RED_BANK, ENV_MISSING_MESSAGE, URL_API, URL_GQL } from 'constants/env'
import { gql, request as gqlRequest } from 'graphql-request'

import { getContractQuery } from 'utils/query'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!URL_API || !ADDRESS_RED_BANK || !URL_GQL) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const markets: Market[] = await (await fetch(`${URL_API}/markets`)).json()

  let query = ''

  markets.forEach((asset: any) => {
    query += getContractQuery(
      asset.denom,
      ADDRESS_RED_BANK || '',
      `
    {
        underlying_debt_amount: {
        denom: "${asset.denom}"
        amount_scaled: "${asset.debt_total_scaled}"
      }
    }`,
    )
  })

  const result = await gqlRequest<DebtsQuery>(
    URL_GQL,
    gql`
    query RedbankBalances {
        debts: wasm {
            ${query}
        }
      }
    `,
  )

  if (result) {
    const debts = Object.keys(result.debts).map((key) => {
      return {
        denom: key,
        amount: result.debts[key],
      }
    })
    return res.status(200).json(debts)
  }

  return res.status(404)
}

interface DebtsQuery {
  debts: {
    [key: string]: string
  }
}
