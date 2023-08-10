import getMarket from 'api/markets/getMarket'
import getAssetIncentive from 'api/incentives/getAssetIncentive'
import getUnderlyingLiquidityAmount from 'api/markets/getMarketUnderlyingLiquidityAmount'
import { BN } from 'utils/helpers'
import { SECONDS_IN_A_YEAR } from 'utils/constants'
import getPrice from 'api/prices/getPrice'
import { ASSETS } from 'constants/assets'
import { byDenom } from 'utils/array'

export default async function calculateAssetIncentivesApy(
  denom: string,
): Promise<BigNumber | null> {
  try {
    const [assetIncentive, market] = await Promise.all([getAssetIncentive(denom), getMarket(denom)])

    if (!assetIncentive) return null

    const [marketLiquidityAmount, assetPrice, baseAssetPrice] = await Promise.all([
      getUnderlyingLiquidityAmount(market),
      getPrice(denom),
      getPrice(assetIncentive.denom),
    ])

    const assetDecimals = (ASSETS.find(byDenom(denom)) as Asset).decimals
    const baseDecimals = (ASSETS.find(byDenom(assetIncentive.denom)) as Asset).decimals

    const marketLiquidityValue = BN(marketLiquidityAmount)
      .shiftedBy(-assetDecimals)
      .multipliedBy(assetPrice)

    const marketReturns = BN(market.liquidityRate).multipliedBy(marketLiquidityValue)
    const annualEmission = BN(assetIncentive.emission_rate)
      .multipliedBy(SECONDS_IN_A_YEAR)
      .shiftedBy(-baseDecimals)
      .multipliedBy(baseAssetPrice)

    const totalAnnualReturnsValue = annualEmission.plus(marketReturns)
    const incentivesApy = totalAnnualReturnsValue.dividedBy(marketLiquidityValue).multipliedBy(100)

    return incentivesApy
  } catch (ex) {
    console.error(ex)
    return null
  }
}
