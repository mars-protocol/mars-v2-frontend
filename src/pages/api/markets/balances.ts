import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'
import { Coin } from '@cosmjs/stargate'

import { ADDRESS_RED_BANK, ENV_MISSING_MESSAGE, GQL } from 'constants/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!GQL || !ADDRESS_RED_BANK) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const result = await gqlRequest<Result>(
    GQL,
    gql`
    query RedbankBalances {
      bank {
              balance(
                  address: "${ADDRESS_RED_BANK}"
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
