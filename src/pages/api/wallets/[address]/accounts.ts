import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { NextApiRequest, NextApiResponse } from 'next'

import { ADDRESS_ACCOUNT_NFT, ENV_MISSING_MESSAGE, URL_RPC } from 'constants/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!URL_RPC || !ADDRESS_ACCOUNT_NFT) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const address = req.query.address

  const client = await CosmWasmClient.connect(URL_RPC)

  const data = await client.queryContractSmart(ADDRESS_ACCOUNT_NFT, {
    tokens: {
      owner: address,
    },
  })

  if (data.tokens) {
    return res.status(200).json(data.tokens)
  }

  return res.status(404)
}
