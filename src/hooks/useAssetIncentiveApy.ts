import useSWR from 'swr'

import getTotalActiveEmissionValue from 'api/incentives/getTotalActiveEmissionValue'
import useMarket from 'hooks/markets/useMarket'
import useChainConfig from 'hooks/useChainConfig'
import usePrice from 'hooks/usePrice'
import { SECONDS_IN_A_YEAR } from 'utils/constants'
import { BN } from 'utils/helpers'

export default function useAssetIncentivesApy(denom: string) {
  const chainConfig = useChainConfig()
  const market = useMarket(denom)
  const price = usePrice(denom)

  return useSWR(
    market && `chains/${chainConfig.id}/assets/${denom}/incentives`,
    () => calculateAssetIncentivesApy(chainConfig, market!, price),
    {
      revalidateOnFocus: false,
    },
  )
}

async function calculateAssetIncentivesApy(
  chainConfig: ChainConfig,
  market: Market,
  price: BigNumber,
) {
  const totalActiveEmissionValue = await getTotalActiveEmissionValue(
    chainConfig,
    market.asset.denom,
  )

  if (!totalActiveEmissionValue) return null

  const marketLiquidityValue = BN(market.deposits)
    .shiftedBy(-market.asset.decimals)
    .multipliedBy(price)

  const marketReturns = BN(market.apy.deposit).multipliedBy(marketLiquidityValue)
  const annualEmission = totalActiveEmissionValue.multipliedBy(SECONDS_IN_A_YEAR)

  const totalAnnualReturnsValue = annualEmission.plus(marketReturns)
  return totalAnnualReturnsValue.dividedBy(marketLiquidityValue).multipliedBy(100)
}
