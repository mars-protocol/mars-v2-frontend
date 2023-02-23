import { NextApiRequest, NextApiResponse } from 'next'

import { ENV_MISSING_MESSAGE, URL_API } from 'constants/env'
import { getMarketAssets } from 'utils/assets'
import { Coin } from '@cosmjs/stargate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!URL_API) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }

  const marketAssets = getMarketAssets()
  const $liquidity = fetch(`${URL_API}/markets/liquidity`)
  const $markets = fetch(`${URL_API}/markets`)

  const borrow: BorrowData[] = await Promise.all([$liquidity, $markets]).then(
    async ([$liquidity, $markets]) => {
      const liquidity: Coin[] = await $liquidity.json()
      const markets: Market[] = await $markets.json()

      return marketAssets.map((asset) => {
        const currentMarket = markets.find((market) => market.denom === asset.denom)
        return {
          denom: asset.denom,
          borrowRate: currentMarket?.borrow_rate ?? '0',
          marketLiquidity: liquidity.find((coin) => coin.denom === asset.denom)?.amount ?? '0',
        }
      })
    },
  )

  if (borrow) {
    return res.status(200).json(borrow)
  }

  return res.status(404)
}

export interface BorrowData {
  denom: string
  borrowRate: string
  marketLiquidity: string
}
