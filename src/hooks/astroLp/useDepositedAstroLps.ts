import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useMarketDepositCaps from 'hooks/markets/useMarketDepositCaps'
import useAssetParams from 'hooks/params/useAssetParams'
import { useMemo } from 'react'
import { byDenom } from 'utils/array'
import { getAstroLpFromPoolAsset, getDepositedAstroLpFromStakedLpBNCoin } from 'utils/astroLps'

export default function useDepositedAstroLps() {
  const currentAccount = useCurrentAccount()
  const { data: assets } = useAssets()
  const chainConfig = useChainConfig()
  const { data: depositCaps } = useMarketDepositCaps()
  const { data: assetParams } = useAssetParams()

  return useMemo(() => {
    const depositedAstroLps = [] as DepositedAstroLp[]
    if (!currentAccount?.stakedAstroLps) return depositedAstroLps

    currentAccount.stakedAstroLps.forEach((stakedAstroLp) => {
      const asset = assets.find(byDenom(stakedAstroLp.denom))
      if (!asset) return
      const depositCap = depositCaps?.find(byDenom(asset.denom))
      const params = assetParams.find(byDenom(asset.denom))

      if (!depositCap || !params) return
      const farm = getAstroLpFromPoolAsset(asset, chainConfig, depositCap, params)
      if (!farm) return
      const depositedAstroLp = getDepositedAstroLpFromStakedLpBNCoin(assets, stakedAstroLp, farm)
      if (depositedAstroLp) depositedAstroLps.push(depositedAstroLp)
    })

    return depositedAstroLps
  }, [assets, assetParams, chainConfig, currentAccount?.stakedAstroLps, depositCaps])
}
