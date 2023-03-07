import { Coin } from '@cosmjs/stargate'
import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENV.URL_GQL || !ENV.ADDRESS_RED_BANK) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
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

  return res.status(200).json(result.bank.balance)
}

interface Result {
  bank: {
    balance: Coin[]
  }
}
