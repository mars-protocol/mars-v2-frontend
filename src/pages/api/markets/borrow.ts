import { NextApiRequest, NextApiResponse } from 'next'
import { Coin } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'

import { ENV_MISSING_MESSAGE, URL_API } from 'constants/env'
import { getMarketAssets } from 'utils/assets'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!URL_API) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const marketAssets = getMarketAssets()
  const $liquidity = fetch(`${URL_API}/markets/liquidity`)
  const $markets = fetch(`${URL_API}/markets`)
  const $prices = fetch(`${URL_API}/prices`)

  const borrow: BorrowAsset[] = await Promise.all([$liquidity, $markets, $prices]).then(
    async ([$liquidity, $markets, $prices]) => {
      const liquidity: Coin[] = await $liquidity.json()
      const markets: Market[] = await $markets.json()
      const prices: Coin[] = await $prices.json()

      return marketAssets.map((asset) => {
        const currentMarket = markets.find((market) => market.denom === asset.denom)
        const price = prices.find((coin) => coin.denom === asset.denom)?.amount ?? '1'
        const amount = liquidity.find((coin) => coin.denom === asset.denom)?.amount ?? '0'
        return {
          denom: asset.denom,
          borrowRate: currentMarket?.borrow_rate ?? '0',
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
