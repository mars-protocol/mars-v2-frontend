import { gql, request as gqlRequest } from 'graphql-request'

import { ENV } from 'constants/env'

export default async function getBalances() {
  const result = await gqlRequest<Result>(
    ENV.URL_GQL,
    gql`
    query RedbankBalances {
      bank {
              balance(
                  address: "${ENV.ADDRESS_RED_BANK}"
              ) {
                  amount
                  denom
              }
          }
      }
    `,
  )

  return result.bank.balance
}

interface Result {
  bank: {
    balance: Coin[]
  }
}
