import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useMarketDepositCaps from 'hooks/markets/useMarketDepositCaps'
import useAssetParams from 'hooks/params/useAssetParams'
import { byDenom } from 'utils/array'
import { getFarmFromPoolAsset } from 'utils/farms'

export default function useDepositedFarms() {
  const currentAccount = useCurrentAccount()
  const { data: assets } = useAssets()

  const depositedFarms = [] as DepositedFarm[]

  currentAccount?.stakedAstroLps.forEach((stakedAstroLp) => {
    const asset = assets.find(byDenom(stakedAstroLp.denom))
    if (!asset || !asset.poolInfo) return
    const primaryAsset = assets.find(byDenom(asset.poolInfo.assets.primary.denom))
    const secondaryAsset = assets.find(byDenom(asset.poolInfo.assets.secondary.denom))
    const chainConfig = useChainConfig()

    const { data: depositCaps } = useMarketDepositCaps()
    const { data: assetParams } = useAssetParams()
    const depositCap = depositCaps?.find(byDenom(asset.denom))
    const params = assetParams.find(byDenom(asset.denom))

    if (!depositCap || !params) return
    const farm = getFarmFromPoolAsset(asset, chainConfig, depositCap, params)
    if (!farm) return

    if (!primaryAsset || !secondaryAsset) return
    const primaryAssetAmount = asset.poolInfo.assetsPerShare.primary.times(stakedAstroLp.amount)
    const secondaryAssetAmount = asset.poolInfo.assetsPerShare.secondary.times(stakedAstroLp.amount)

    const amountsAndValues: FarmValuesAndAmounts = {
      amounts: {
        primary: primaryAssetAmount,
        secondary: asset.poolInfo.assetsPerShare.secondary.times(stakedAstroLp.amount),
      },
      values: {
        primary: primaryAssetAmount
          .times(primaryAsset.price?.amount ?? 0)
          .shiftedBy(-primaryAsset.decimals),
        secondary: secondaryAssetAmount
          .times(secondaryAsset.price?.amount ?? 0)
          .shiftedBy(-secondaryAsset.decimals),
      },
    }

    depositedFarms.push({ ...farm, ...amountsAndValues } as DepositedFarm)
  })

  return depositedFarms
}
