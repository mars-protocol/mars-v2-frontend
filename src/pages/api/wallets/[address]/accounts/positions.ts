import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { NextApiRequest, NextApiResponse } from 'next'

import { ENV, ENV_MISSING_MESSAGE, VERCEL_BYPASS } from 'constants/env'
import { Coin } from '@cosmjs/stargate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENV.URL_RPC || !ENV.ADDRESS_CREDIT_MANAGER || !ENV.URL_API) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const address = req.query.address

  const accounts: string[] = await (
    await fetch(`${ENV.URL_API}/wallets/${address}/accounts${VERCEL_BYPASS}`)
  ).json()

  const client = await CosmWasmClient.connect(ENV.URL_RPC)

  const $positions: Promise<PositionResponse>[] = accounts.map((account) =>
    client.queryContractSmart(ENV.ADDRESS_CREDIT_MANAGER!, {
      positions: {
        account_id: `${account}`,
      },
    }),
  )

  const positions = await Promise.all($positions).then((positions) => positions)

  if (positions) {
    return res.status(200).json(parseResponse(positions))
  }

  return res.status(404)
}

interface PositionResponse {
  account_id: string
  deposits: Coin[]
  debts: Coin[]
  lends: Coin[]
}

function parseResponse(response: PositionResponse[]): Position[] {
  return response.map((positionResponse) => ({
    account: positionResponse.account_id,
    deposits: positionResponse.deposits,
    debts: positionResponse.debts,
    lends: positionResponse.lends,
  }))
}
