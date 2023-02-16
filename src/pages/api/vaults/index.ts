import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await CosmWasmClient.connect(
    'https://testnet-osmosis-node.marsprotocol.io/XF32UOOU55CX/osmosis-rpc-front/',
  )

  const data = await client.queryContractSmart(
    'osmo169xhpftsee275j3cjudj6qfzdpfp8sdllgeeprud4ynwr4sj6m4qel2ezp',
    {
      vaults_info: { limit: 5, start_after: undefined },
    },
  )

  if (data) {
    return res.status(200).json(data)
  }

  return res.status(404)
}
