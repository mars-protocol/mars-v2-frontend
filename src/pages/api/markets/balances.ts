import { Coin } from '@cosmjs/stargate'
import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

import { ADDRESS_RED_BANK, ENV_MISSING_MESSAGE, URL_GQL } from 'constants/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!URL_GQL || !ADDRESS_RED_BANK) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const result = await gqlRequest<Result>(
    URL_GQL,
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
