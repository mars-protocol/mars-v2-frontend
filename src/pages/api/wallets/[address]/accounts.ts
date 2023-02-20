import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_RPC
  const accountNftAddress = process.env.NEXT_PUBLIC_ACCOUNT_NFT

  if (!url || !accountNftAddress) {
    return res.status(404).json({ message: 'Env variables missing' })
  }
  const address = req.query.address

  const client = await CosmWasmClient.connect(url)

  const data = await client.queryContractSmart(accountNftAddress, {
    tokens: {
      owner: address,
    },
  })

  if (data.tokens) {
    return res.status(200).json(data.tokens)
  }

  return res.status(404)
}
