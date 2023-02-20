import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { NextApiRequest, NextApiResponse } from 'next'

import { ADDRESS_CREDIT_MANAGER, ENV_MISSING_MESSAGE, RPC } from 'constants/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!RPC || !ADDRESS_CREDIT_MANAGER) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const accountId = req.query.id

  const client = await CosmWasmClient.connect(RPC)

  const data = await client.queryContractSmart(ADDRESS_CREDIT_MANAGER, {
    positions: {
      account_id: accountId,
    },
  })

  if (data) {
    return res.status(200).json(data)
  }

  return res.status(404)
}
