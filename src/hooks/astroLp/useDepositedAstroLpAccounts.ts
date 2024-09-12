import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useMarketDepositCaps from 'hooks/markets/useMarketDepositCaps'
import useAssetParams from 'hooks/params/useAssetParams'
import { useMemo } from 'react'
import { byDenom } from 'utils/array'
import { getAstroLpFromPoolAsset, getDepositedAstroLpFromStakedLpBNCoin } from 'utils/astroLps'

export default function useDepositedAstroLpAccounts(accounts?: Account[]) {
  const { data: assets } = useAssets()
  const chainConfig = useChainConfig()
  const { data: depositCaps } = useMarketDepositCaps()
  const { data: assetParams } = useAssetParams()

  return useMemo(() => {
    const depositedAstroLps = [] as DepositedAstroLpAccounts[]
    if (!accounts) return depositedAstroLps
    accounts.forEach((account) => {
      if (!account?.stakedAstroLps) return depositedAstroLps

      account.stakedAstroLps.forEach((stakedAstroLp) => {
        const asset = assets.find(byDenom(stakedAstroLp.denom))
        if (!asset) return
        const depositCap = depositCaps?.find(byDenom(asset.denom))
        const params = assetParams.find(byDenom(asset.denom))

        if (!depositCap || !params) return
        const farm = getAstroLpFromPoolAsset(asset, chainConfig, depositCap, params)
        if (!farm) return
        const depositedAstroLp = getDepositedAstroLpFromStakedLpBNCoin(assets, stakedAstroLp, farm)
        if (depositedAstroLp) depositedAstroLps.push({ astroLp: depositedAstroLp, account })
      })
    })
    return depositedAstroLps
  }, [assets, assetParams, chainConfig, accounts, depositCaps])
}
