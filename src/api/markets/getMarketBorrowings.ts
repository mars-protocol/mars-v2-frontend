import { BN } from 'utils/helpers'
import getPrices from 'api/prices/getPrices'
import getMarkets from 'api/markets/getMarkets'
import getMarketLiquidity from 'api/markets/getMarketLiquidity'

export default async function getMarketBorrowings(): Promise<BorrowAsset[]> {
  const liquidity = await getMarketLiquidity()
  const borrowEnabledMarkets = (await getMarkets()).filter((market: Market) => market.borrowEnabled)
  const prices = await getPrices()

  const borrow: BorrowAsset[] = borrowEnabledMarkets.map((market) => {
    const price = prices.find((coin) => coin.denom === market.denom)?.amount ?? '1'
    const amount = liquidity.find((coin) => coin.denom === market.denom)?.amount ?? '0'
    return {
      denom: market.denom,
      borrowRate: market.borrowRate ?? 0,
      liquidity: {
        amount: amount,
        value: BN(amount).times(price).toString(),
      },
    }
  })

  if (borrow) {
    return borrow
  }

  return new Promise((_, reject) => reject('No data'))
}
