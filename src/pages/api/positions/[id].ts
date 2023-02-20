import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_RPC
  const creditManagerAddress = process.env.NEXT_PUBLIC_CREDIT_MANAGER

  if (!url || !creditManagerAddress) {
    return res.status(404).json({ message: 'Env variables missing' })
  }

  const accountId = req.query.id

  const client = await CosmWasmClient.connect(url)

  const data = await client.queryContractSmart(creditManagerAddress, {
    positions: {
      account_id: accountId,
    },
  })

  if (data) {
    return res.status(200).json(data)
  }

  return res.status(404)
}
