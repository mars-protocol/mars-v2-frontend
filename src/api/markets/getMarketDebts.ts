import { gql, request as gqlRequest } from 'graphql-request'

import { ENV } from 'constants/env'
import { denomToKey, getContractQuery, keyToDenom } from 'utils/query'
import getMarkets from 'api/markets/getMarkets'

export default async function getMarketDebts(): Promise<Coin[]> {
  const markets: Market[] = await getMarkets()

  let query = ''

  markets.forEach((asset) => {
    query += getContractQuery(
      denomToKey(asset.denom),
      ENV.ADDRESS_RED_BANK || '',
      `
    {
        underlying_debt_amount: {
        denom: "${asset.denom}"
        amount_scaled: "${asset.debtTotalScaled}"
      }
    }`,
    )
  })

  const result = await gqlRequest<DebtsQuery>(
    ENV.URL_GQL,
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
        denom: keyToDenom(key),
        amount: result.debts[key],
      }
    })
    return debts
  }

  return new Promise((_, reject) => reject('No data'))
}

interface DebtsQuery {
  debts: {
    [key: string]: string
  }
}
