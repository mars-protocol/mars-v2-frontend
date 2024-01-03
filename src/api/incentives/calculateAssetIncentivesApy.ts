import getTotalActiveEmissionValue from 'api/incentives/getTotalActiveEmissionValue'
import getMarket from 'api/markets/getMarket'
import getUnderlyingLiquidityAmount from 'api/markets/getMarketUnderlyingLiquidityAmount'
import getPrice from 'api/prices/getPrice'
import { byDenom } from 'utils/array'
import { SECONDS_IN_A_YEAR } from 'utils/constants'
import { BN } from 'utils/helpers'

export default async function calculateAssetIncentivesApy(
  chainConfig: ChainConfig,
  denom: string,
): Promise<BigNumber | null> {
  try {
    const [totalActiveEmissionValue, market] = await Promise.all([
      getTotalActiveEmissionValue(chainConfig, denom),
      getMarket(chainConfig, denom),
    ])

    if (!totalActiveEmissionValue) return null

    const [marketLiquidityAmount, assetPrice] = await Promise.all([
      getUnderlyingLiquidityAmount(chainConfig, market),
      getPrice(chainConfig, denom),
    ])

    const assetDecimals = (chainConfig.assets.find(byDenom(denom)) as Asset).decimals

    const marketLiquidityValue = BN(marketLiquidityAmount)
      .shiftedBy(-assetDecimals)
      .multipliedBy(assetPrice)

    const marketReturns = BN(market.apy.deposit).multipliedBy(marketLiquidityValue)
    const annualEmission = totalActiveEmissionValue.multipliedBy(SECONDS_IN_A_YEAR)

    const totalAnnualReturnsValue = annualEmission.plus(marketReturns)
    return totalAnnualReturnsValue.dividedBy(marketLiquidityValue).multipliedBy(100)
  } catch (ex) {
    console.error(ex)
    return null
  }
}
