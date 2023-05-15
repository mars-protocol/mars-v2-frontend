import { gql, request as gqlRequest } from 'graphql-request'

import { ENV } from 'constants/env'
import { denomToKey, getContractQuery, keyToDenom } from 'utils/query'
import getMarkets from 'api/markets/getMarkets'

export default async function getMarketDeposits(): Promise<Coin[]> {
  const markets = await getMarkets()

  let query = ''

  markets.forEach((market: Market) => {
    query += getContractQuery(
      denomToKey(market.denom),
      ENV.ADDRESS_RED_BANK || '',
      `
    {
      underlying_liquidity_amount: {
        denom: "${market.denom}"
        amount_scaled: "${market.collateralTotalScaled}"
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
    return deposits
  }

  return new Promise((_, reject) => reject('No data'))
}

interface DepositsQuery {
  deposits: {
    [key: string]: string
  }
}
