import { NextApiRequest, NextApiResponse } from 'next'

import { ENV_MISSING_MESSAGE, URL_REST } from 'constants/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!URL_REST) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const address = req.query.address
  const uri = '/cosmos/bank/v1beta1/balances/'

  const response = await fetch(`${URL_REST}${uri}${address}`)

  if (response.ok) {
    const data = await response.json()
    return res.status(200).json(data.balances)
  }

  return res.status(404)
}
