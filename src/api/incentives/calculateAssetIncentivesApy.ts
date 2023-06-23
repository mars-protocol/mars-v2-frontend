import getMarket from 'api/markets/getMarket'
import getAssetIncentive from 'api/incentives/getAssetIncentive'
import getUnderlyingLiquidityAmount from 'api/markets/getMarketUnderlyingLiquidityAmount'
import { BN } from 'utils/helpers'
import { SECONDS_IN_A_YEAR } from 'utils/constants'
import getPrice from 'api/prices/getPrice'
import getMarsPrice from 'api/prices/getMarsPrice'
import { ASSETS } from 'constants/assets'
import { byDenom } from 'utils/array'

export default async function calculateAssetIncentivesApy(denom: string): Promise<number | null> {
  try {
    const [assetIncentive, market] = await Promise.all([getAssetIncentive(denom), getMarket(denom)])

    if (!assetIncentive) return null

    const [marketLiquidityAmount, assetPriceResponse, marsPrice] = await Promise.all([
      getUnderlyingLiquidityAmount(market),
      getPrice(denom),
      getMarsPrice(),
    ])

    const assetDecimals = (ASSETS.find(byDenom(denom)) as Asset).decimals
    const marsDecimals = 6,
      priceFeedDecimals = 6

    const assetPrice = BN(assetPriceResponse.price).shiftedBy(assetDecimals - priceFeedDecimals)
    const marketLiquidityValue = BN(marketLiquidityAmount)
      .shiftedBy(-assetDecimals)
      .multipliedBy(assetPrice)

    const marketReturns = BN(market.liquidityRate).multipliedBy(marketLiquidityValue)
    const annualEmission = BN(assetIncentive.emission_per_second)
      .multipliedBy(SECONDS_IN_A_YEAR)
      .shiftedBy(-marsDecimals)
      .multipliedBy(marsPrice)

    const totalAnnualReturnsValue = annualEmission.plus(marketReturns)
    const incentivesApy = totalAnnualReturnsValue.dividedBy(marketLiquidityValue).multipliedBy(100)

    return incentivesApy.toNumber()
  } catch (ex) {
    console.error(ex)
    return null
  }
}
