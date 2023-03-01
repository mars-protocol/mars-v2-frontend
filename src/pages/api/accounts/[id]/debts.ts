import { NextApiRequest, NextApiResponse } from 'next'

import { ADDRESS_CREDIT_MANAGER, ENV_MISSING_MESSAGE, URL_API, URL_RPC } from 'constants/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!URL_RPC || !ADDRESS_CREDIT_MANAGER || !URL_API) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const accountId = req.query.id

  const account = await (await fetch(`${URL_API}/accounts/${accountId}`)).json()

  if (account) {
    return res.status(200).json([{ denom: 'uosmo', amount: '123876' }])
  }

  return res.status(404)
}
