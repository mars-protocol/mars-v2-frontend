import useSWR from 'swr'

import { BN_ZERO } from 'constants/math'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import useMarket from 'hooks/markets/useMarket'
import { byDenom } from 'utils/array'
import { SECONDS_IN_A_YEAR } from 'utils/constants'
import { BN } from 'utils/helpers'

export default function useAssetIncentivesApy(denom: string) {
  const chainConfig = useChainConfig()
  const market = useMarket(denom)
  const assets = useDepositEnabledAssets()
  const clients = useClients()
  const enabled = !!market && !!assets.length && !!clients

  return useSWR(
    enabled && `chains/${chainConfig.id}/assets/${denom}/incentives`,
    () => calculateAssetIncentivesApy(clients!, assets, market!),
    {
      revalidateOnFocus: false,
    },
  )
}

async function calculateAssetIncentivesApy(
  clients: ContractClients,
  assets: Asset[],
  market: Market,
) {
  const totalActiveEmissionValue = await getTotalActiveEmissionValue(clients, assets, market)

  if (!totalActiveEmissionValue) return null
  const price = market.asset.price?.amount ?? BN_ZERO

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
  market: Market,
): Promise<BigNumber | null> {
  try {
    const activeEmissions = await clients.incentives.activeEmissions({
      denom: market.asset.denom,
      kind: 'red_bank',
    })

    if (activeEmissions.length === 0) {
      throw 'Asset has no active incentive emission.'
    }

    return activeEmissions.reduce((accumulation, current, index) => {
      const price = assets.find(byDenom(current.denom))?.price?.amount ?? BN_ZERO
      const decimals = assets.find(byDenom(current.denom))?.decimals as number
      const emissionValue = BN(current.emission_rate).shiftedBy(-decimals).multipliedBy(price)

      return accumulation.plus(emissionValue)
    }, BN_ZERO)
  } catch (ex) {
    return null
  }
}
