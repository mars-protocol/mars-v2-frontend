import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useMarketDepositCaps from 'hooks/markets/useMarketDepositCaps'
import useAssetParams from 'hooks/params/useAssetParams'
import { byDenom } from 'utils/array'
import { getDepositedFarmFromStakedLpBNCoin, getFarmFromPoolAsset } from 'utils/farms'

export default function useDepositedFarms() {
  const currentAccount = useCurrentAccount()
  const { data: assets } = useAssets()
  const chainConfig = useChainConfig()
  const { data: depositCaps } = useMarketDepositCaps()
  const { data: assetParams } = useAssetParams()

  const depositedFarms = [] as DepositedFarm[]
  if (!currentAccount?.stakedAstroLps) return depositedFarms

  currentAccount.stakedAstroLps.forEach((stakedAstroLp) => {
    const asset = assets.find(byDenom(stakedAstroLp.denom))
    if (!asset) return
    const depositCap = depositCaps?.find(byDenom(asset.denom))
    const params = assetParams.find(byDenom(asset.denom))

    if (!depositCap || !params) return
    const farm = getFarmFromPoolAsset(asset, chainConfig, depositCap, params)
    if (!farm) return
    const depositedFarm = getDepositedFarmFromStakedLpBNCoin(assets, stakedAstroLp, farm)
    if (depositedFarm) depositedFarms.push(depositedFarm)
  })

  return depositedFarms
}
