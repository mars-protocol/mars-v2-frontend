import { useMemo } from 'react'

import usePoolAssets from 'hooks/assets/usePoolAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useMarketDepositCaps from 'hooks/markets/useMarketDepositCaps'
import useAssetParams from 'hooks/params/useAssetParams'
import { byDenom } from 'utils/array'
import { getAstroLpFromPoolAsset } from 'utils/astroLps'

export default function useAvailableAstroLps() {
  const chainConfig = useChainConfig()
  const assets = usePoolAssets()
  const whitelistedPools = assets.filter((asset) => asset.isWhitelisted)
  const { data: depositCaps } = useMarketDepositCaps()
  const { data: assetParams } = useAssetParams()

  return useMemo(() => {
    const mappedAstroLps = [] as AstroLp[]

    whitelistedPools.forEach((asset) => {
      if (
        !asset.poolInfo ||
        asset.denom ===
          'factory/neutron1yem82r0wf837lfkwvcu2zxlyds5qrzwkz8alvmg0apyrjthk64gqeq2e98/astroport/share'
      )
        return
      const depositCap = depositCaps?.find(byDenom(asset.denom))
      const params = assetParams.find(byDenom(asset.denom))

      if (!depositCap || !params) return
      const farm = getAstroLpFromPoolAsset(asset, chainConfig, depositCap, params)

      if (!farm) return
      mappedAstroLps.push(farm)
    })
    return mappedAstroLps
  }, [depositCaps, assetParams, chainConfig, whitelistedPools])
}
