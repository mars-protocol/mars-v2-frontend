import { NextApiRequest, NextApiResponse } from 'next'

import { Coin } from '@cosmjs/stargate'
import { ENV_MISSING_MESSAGE, URL_API } from 'constants/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!URL_API) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const $deposits = fetch(`${URL_API}/markets/deposits`)
  const $debts = fetch(`${URL_API}/markets/debts`)

  const liquidity: Coin[] = await Promise.all([$deposits, $debts]).then(
    async ([$deposits, $debts]) => {
      const deposits: Coin[] = await $deposits.json()
      const debts: Coin[] = await $debts.json()

      return deposits.map((deposit) => {
        const debt = debts.find((debt) => debt.denom === deposit.denom)

        if (debt) {
          return {
            denom: deposit.denom,
            amount: (Number(deposit.amount) - Number(debt.amount)).toString(),
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
