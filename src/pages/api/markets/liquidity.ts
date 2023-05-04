import { NextApiRequest, NextApiResponse } from 'next'

import { ENV, ENV_MISSING_MESSAGE, VERCEL_BYPASS } from 'constants/env'
import { BN } from 'utils/helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENV.URL_API) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const $deposits = fetch(`${ENV.URL_API}/markets/deposits${VERCEL_BYPASS}`)
  const $debts = fetch(`${ENV.URL_API}/markets/debts${VERCEL_BYPASS}`)

  const liquidity: Coin[] = await Promise.all([$deposits, $debts]).then(
    async ([$deposits, $debts]) => {
      const deposits: Coin[] = await $deposits.json()
      const debts: Coin[] = await $debts.json()

      return deposits.map((deposit) => {
        const debt = debts.find((debt) => debt.denom === deposit.denom)

        if (debt) {
          return {
            denom: deposit.denom,
            amount: BN(deposit.amount).minus(debt.amount).toString(),
          }
        }

        return {
          denom: deposit.denom,
          amount: '0',
        }
      })
    },
  )

  if (liquidity) {
    return res.status(200).json(liquidity)
  }

  return res.status(404)
}
