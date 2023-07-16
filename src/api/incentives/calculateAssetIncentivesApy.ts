import getMarket from 'api/markets/getMarket'
import getAssetIncentive from 'api/incentives/getAssetIncentive'
import getUnderlyingLiquidityAmount from 'api/markets/getMarketUnderlyingLiquidityAmount'
import { BN } from 'utils/helpers'
import { SECONDS_IN_A_YEAR } from 'utils/constants'
import getPrice from 'api/prices/getPrice'
import getMarsPrice from 'api/prices/getMarsPrice'
import { ASSETS } from 'constants/assets'
import { byDenom, bySymbol } from 'utils/array'

export default async function calculateAssetIncentivesApy(
  denom: string,
): Promise<BigNumber | null> {
  try {
    const [assetIncentive, market] = await Promise.all([getAssetIncentive(denom), getMarket(denom)])

    if (!assetIncentive) return null

    const [marketLiquidityAmount, assetPrice, marsPrice] = await Promise.all([
      getUnderlyingLiquidityAmount(market),
      getPrice(denom),
      getMarsPrice(),
    ])

    const assetDecimals = (ASSETS.find(byDenom(denom)) as Asset).decimals
    const marsDecimals = (ASSETS.find(bySymbol('MARS')) as Asset).decimals

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

    return incentivesApy
  } catch (ex) {
    console.error(ex)
    return null
  }
}
