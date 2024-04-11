import useSWR from 'swr'

import { BN_ZERO } from 'constants/math'
import useAllAssets from 'hooks/assets/useAllAssets'
import useMarket from 'hooks/markets/useMarket'
import usePrices from 'hooks/prices/usePrices'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import { byDenom } from 'utils/array'
import { SECONDS_IN_A_YEAR } from 'utils/constants'
import { BN } from 'utils/helpers'

export default function useAssetIncentivesApy(denom: string) {
  const chainConfig = useChainConfig()
  const market = useMarket(denom)
  const { data: prices } = usePrices()
  const assets = useAllAssets()
  const clients = useClients()
  const enabled = !!market && !!prices.length && !!assets.length && !!clients

  return useSWR(
    enabled && `chains/${chainConfig.id}/assets/${denom}/incentives`,
    () => calculateAssetIncentivesApy(clients!, assets, prices, market!),
    {
      revalidateOnFocus: false,
    },
  )
}

async function calculateAssetIncentivesApy(
  clients: ContractClients,
  assets: Asset[],
  prices: BNCoin[],
  market: Market,
) {
  const totalActiveEmissionValue = await getTotalActiveEmissionValue(
    clients,
    assets,
    prices,
    market,
  )

  if (!totalActiveEmissionValue) return null
  const price = prices.find(byDenom(market.asset.denom))?.amount ?? BN_ZERO

  const marketLiquidityValue = BN(market.deposits)
    .shiftedBy(-market.asset.decimals)
    .multipliedBy(price)

  const marketReturns = BN(market.apy.deposit).multipliedBy(marketLiquidityValue)
  const annualEmission = totalActiveEmissionValue.multipliedBy(SECONDS_IN_A_YEAR)

  const totalAnnualReturnsValue = annualEmission.plus(marketReturns)
  return totalAnnualReturnsValue.dividedBy(marketLiquidityValue).multipliedBy(100)
}

async function getTotalActiveEmissionValue(
  clients: ContractClients,
  assets: Asset[],
  prices: BNCoin[],
  market: Market,
): Promise<BigNumber | null> {
  try {
    const activeEmissions = await clients.incentives.activeEmissions({
      collateralDenom: market.asset.denom,
    })

    if (activeEmissions.length === 0) {
      throw 'Asset has no active incentive emission.'
    }

    return activeEmissions.reduce((accumulation, current, index) => {
      const price = prices.find(byDenom(current.denom))?.amount ?? BN_ZERO
      const decimals = assets.find(byDenom(current.denom))?.decimals as number
      const emissionValue = BN(current.emission_rate).shiftedBy(-decimals).multipliedBy(price)

      return accumulation.plus(emissionValue)
    }, BN_ZERO)
  } catch (ex) {
    return null
  }
}
