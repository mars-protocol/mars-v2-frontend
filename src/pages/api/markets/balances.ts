import { gql, request as gqlRequest } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'

import { Coin } from '@cosmjs/stargate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const network = process.env.NEXT_PUBLIC_NETWORK
  const url = process.env.NEXT_PUBLIC_GQL
  const redBankAddress = process.env.NEXT_PUBLIC_RED_BANK
  const incentivesAddress = process.env.NEXT_PUBLIC_INCENTIVES

  if (!url || !redBankAddress || !incentivesAddress || !network) {
    return res.status(404).json({ message: 'Env variables missing' })
  }

  const result = await gqlRequest<Result>(
    url,
    gql`
    query RedbankBalances {
      bank {
              balance(
                  address: "${redBankAddress}"
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
