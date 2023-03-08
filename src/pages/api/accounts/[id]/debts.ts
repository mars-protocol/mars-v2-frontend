import { NextApiRequest, NextApiResponse } from 'next'

import { ENV, ENV_MISSING_MESSAGE, FETCH_HEADERS } from 'constants/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENV.URL_RPC || !ENV.ADDRESS_CREDIT_MANAGER || !ENV.URL_API) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const accountId = req.query.id

  const account = await (await fetch(`${ENV.URL_API}/accounts/${accountId}`, FETCH_HEADERS)).json()

  if (account) {
    return res.status(200).json([{ denom: 'uosmo', amount: '123876' }])
  }

  return res.status(404)
}
