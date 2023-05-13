import { gql, request as gqlRequest } from 'graphql-request'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import { denomToKey, getContractQuery, keyToDenom } from 'utils/query'
import getMarkets from './getMarkets'

export default async function getMarketDebts(): Promise<Coin[]> {
  if (!ENV.URL_API || !ENV.ADDRESS_RED_BANK || !ENV.URL_GQL) {
    return new Promise((_, reject) => reject(ENV_MISSING_MESSAGE))
  }

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
