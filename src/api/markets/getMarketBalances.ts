import { gql, request as gqlRequest } from 'graphql-request'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'

export default async function getBalances() {
  if (!ENV.URL_GQL || !ENV.ADDRESS_RED_BANK) {
    return new Promise((_, reject) => reject(ENV_MISSING_MESSAGE))
  }

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
