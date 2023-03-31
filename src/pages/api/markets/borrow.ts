import { Coin } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'
import { NextApiRequest, NextApiResponse } from 'next'

import { ENV, ENV_MISSING_MESSAGE, VERCEL_BYPASS } from 'constants/env'
import { getMarketAssets } from 'utils/assets'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENV.URL_API) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const $liquidity = fetch(`${ENV.URL_API}/markets/liquidity${VERCEL_BYPASS}`)
  const $markets = fetch(`${ENV.URL_API}/markets${VERCEL_BYPASS}`)
  const $prices = fetch(`${ENV.URL_API}/prices${VERCEL_BYPASS}`)

  const borrow: BorrowAsset[] = await Promise.all([$liquidity, $markets, $prices]).then(
    async ([$liquidity, $markets, $prices]) => {
      const liquidity: Coin[] = await $liquidity.json()
      const borrowEnabledMarkets: Market[] = (await $markets.json()).filter(
        (market: Market) => market.borrowEnabled,
      )
      const prices: Coin[] = await $prices.json()

      return borrowEnabledMarkets.map((market) => {
        const price = prices.find((coin) => coin.denom === market.denom)?.amount ?? '1'
        const amount = liquidity.find((coin) => coin.denom === market.denom)?.amount ?? '0'
        return {
          denom: market.denom,
          borrowRate: market.borrowRate ?? 0,
          liquidity: {
            amount: amount,
            value: new BigNumber(amount).times(price).toString(),
          },
        }
      })
    },
  )

  if (borrow) {
    return res.status(200).json(borrow)
  }

  return res.status(404)
}
