import { useMemo } from 'react'

import usePoolAssets from 'hooks/assets/usePoolAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useMarketDepositCaps from 'hooks/markets/useMarketDepositCaps'
import useAssetParams from 'hooks/params/useAssetParams'
import { byDenom } from 'utils/array'
import { getFarmFromPoolAsset } from 'utils/farms'

export default function useAvailableFarms() {
  const chainConfig = useChainConfig()
  const assets = usePoolAssets()
  const whitelistedPools = assets.filter((asset) => asset.isWhitelisted)
  const { data: depositCaps } = useMarketDepositCaps()
  const { data: assetParams } = useAssetParams()
  const mappedFarms = [] as Farm[]

  whitelistedPools.forEach((asset) => {
    if (!asset.poolInfo) return
    const depositCap = depositCaps?.find(byDenom(asset.denom))
    const params = assetParams.find(byDenom(asset.denom))

    if (!depositCap || !params) return
    const farm = getFarmFromPoolAsset(asset, chainConfig, depositCap, params)

    if (!farm) return
    mappedFarms.push(farm)
  })

  return useMemo(() => mappedFarms, [mappedFarms])
}
