import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_RPC
  const creditManagerAddress = process.env.NEXT_PUBLIC_CREDIT_MANAGER

  if (!url || !creditManagerAddress) {
    return res.status(404).json({ message: 'Env variables missing' })
  }
  const client = await CosmWasmClient.connect(url)

  const data = await client.queryContractSmart(creditManagerAddress, {
    vaults_info: { limit: 5, start_after: undefined },
  })

  if (data) {
    return res.status(200).json(data)
  }

  return res.status(404)
}
