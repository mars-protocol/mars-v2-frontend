import { BN } from 'utils/helpers'
import getPrices from 'api/prices/getPrices'
import getMarkets from 'api/markets/getMarkets'
import { getEnabledMarketAssets } from 'utils/assets'
import getMarketLiquidities from 'api/markets/getMarketLiquidities'

export default async function getMarketBorrowings(): Promise<BorrowAsset[]> {
  const liquidities = await getMarketLiquidities()
  const enabledAssets = getEnabledMarketAssets()
  const borrowEnabledMarkets = (await getMarkets()).filter((market: Market) => market.borrowEnabled)
  const prices = await getPrices()

  const borrow: BorrowAsset[] = borrowEnabledMarkets.map((market) => {
    const price = prices.find((coin) => coin.denom === market.denom)?.amount ?? '1'
    const amount = liquidities.find((coin) => coin.denom === market.denom)?.amount ?? '0'
    const asset = enabledAssets.find((asset) => asset.denom === market.denom)!

    return {
      ...asset,
      borrowRate: market.borrowRate ?? 0,
      liquidity: {
        amount: BN(amount),
        value: BN(amount).times(price),
      },
    }
  })

  if (borrow) {
    return borrow
  }

  return new Promise((_, reject) => reject('No data'))
}
