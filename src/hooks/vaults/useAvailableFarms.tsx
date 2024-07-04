import { useMemo } from 'react'

import usePoolAssets from 'hooks/assets/usePoolAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useMarketDepositCaps from 'hooks/markets/useMarketDepositCaps'
import useAssetParams from 'hooks/params/useAssetParams'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export default function useAvailableFarms() {
  const chainConfig = useChainConfig()
  const pools = usePoolAssets()
  const whitelistedPools = pools.filter((pool) => pool.isWhitelisted)
  const { data: depositCaps } = useMarketDepositCaps()
  const { data: assetParams } = useAssetParams()
  const mappedFarms = [] as Farm[]

  whitelistedPools.forEach((pool) => {
    if (!pool.poolInfo) return
    const depositCap = depositCaps?.find(byDenom(pool.denom))
    const params = assetParams.find(byDenom(pool.denom))

    const mappedFarms = [] as Farm[]

    mappedFarms.push({
      address: pool.poolInfo.address,
      name: pool.name,
      lockup: {
        duration: 0,
        timeframe: '',
      },
      provider: chainConfig.dexName,
      denoms: {
        primary: pool.poolInfo.assets.primary.denom,
        secondary: pool.poolInfo.assets.secondary.denom,
        lp: pool.denom,
        farm: pool.poolInfo.address,
      },
      symbols: {
        primary: pool.poolInfo.assets.primary.symbol,
        secondary: pool.poolInfo.assets.secondary.symbol,
      },
      ltv: {
        max: Number(params?.max_loan_to_value ?? 0),
        liq: Number(params?.liquidation_threshold ?? 0),
      },
      cap: {
        denom: pool.denom,
        used: BN(depositCap?.amount ?? 0).shiftedBy(-pool.decimals),
        max: BN(depositCap?.cap ?? 0).shiftedBy(-pool.decimals),
      },
      apy: pool.poolInfo.yield.total * 100,
      baseApy: pool.poolInfo.yield.poolFees * 100,
      incentives: pool.poolInfo.rewards,
    } as Farm)
  })

  return useMemo(() => mappedFarms, [mappedFarms])
}
