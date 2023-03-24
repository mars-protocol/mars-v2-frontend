import { NextApiRequest, NextApiResponse } from 'next'

import { ENV, ENV_MISSING_MESSAGE, VERCEL_BYPASS } from 'constants/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENV.URL_RPC || !ENV.ADDRESS_CREDIT_MANAGER || !ENV.URL_API) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const accountId = req.query.id

  const account = await (await fetch(`${ENV.URL_API}/accounts/${accountId}${VERCEL_BYPASS}`)).json()

  if (account) {
    return res.status(200).json(account.debts)
  }

  return res.status(404)
}
