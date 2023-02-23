import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { NextApiRequest, NextApiResponse } from 'next'

import { ADDRESS_CREDIT_MANAGER, ENV_MISSING_MESSAGE, URL_RPC } from 'constants/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!URL_RPC || !ADDRESS_CREDIT_MANAGER) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }
  const client = await CosmWasmClient.connect(URL_RPC)

  const data = await client.queryContractSmart(ADDRESS_CREDIT_MANAGER, {
    allowed_coins: {},
  })

  if (data) {
    return res.status(200).json(data)
  }

  return res.status(404)
}
