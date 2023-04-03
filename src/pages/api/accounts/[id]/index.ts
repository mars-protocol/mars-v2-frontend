import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { NextApiRequest, NextApiResponse } from 'next'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import { resolvePositionResponse } from 'utils/resolvers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENV.URL_RPC || !ENV.ADDRESS_CREDIT_MANAGER) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const accountId = req.query.id

  const client = await CosmWasmClient.connect(ENV.URL_RPC)

  const data: PositionResponse = await client.queryContractSmart(ENV.ADDRESS_CREDIT_MANAGER, {
    positions: {
      account_id: accountId,
    },
  })

  if (data) {
    return res.status(200).json(resolvePositionResponse(data))
  }

  return res.status(404)
}
