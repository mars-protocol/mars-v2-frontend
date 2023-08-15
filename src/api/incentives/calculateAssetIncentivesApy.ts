import getMarket from 'api/markets/getMarket'
import getTotalActiveEmissionValue from 'api/incentives/getTotalActiveEmissionValue'
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
    const [totalActiveEmissionValue, market] = await Promise.all([
      getTotalActiveEmissionValue(denom),
      getMarket(denom),
    ])

    if (!totalActiveEmissionValue) return null

    const [marketLiquidityAmount, assetPrice] = await Promise.all([
      getUnderlyingLiquidityAmount(market),
      getPrice(denom),
    ])

    const assetDecimals = (ASSETS.find(byDenom(denom)) as Asset).decimals

    const marketLiquidityValue = BN(marketLiquidityAmount)
      .shiftedBy(-assetDecimals)
      .multipliedBy(assetPrice)

    const marketReturns = BN(market.liquidityRate).multipliedBy(marketLiquidityValue)
    const annualEmission = totalActiveEmissionValue.multipliedBy(SECONDS_IN_A_YEAR)

    const totalAnnualReturnsValue = annualEmission.plus(marketReturns)
    const incentivesApy = totalAnnualReturnsValue.dividedBy(marketLiquidityValue).multipliedBy(100)

    return incentivesApy
  } catch (ex) {
    console.error(ex)
    return null
  }
}
