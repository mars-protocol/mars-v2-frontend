import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const wallet = req.query.wallet

  const client = await CosmWasmClient.connect(
    'https://testnet-osmosis-node.marsprotocol.io/XF32UOOU55CX/osmosis-rpc-front/',
  )

  const data = await client.queryContractSmart(
    'osmo1xpgx06z2c6zjk49feq75swgv78m6dvht6wramu2gltzjz5j959nq4hggxz',
    {
      tokens: {
        owner: wallet,
      },
    },
  )

  if (data.tokens) {
    return res.status(200).json(data.tokens)
  }

  return res.status(404)
}
