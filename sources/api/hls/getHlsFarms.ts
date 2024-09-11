import { TotalDepositResponse } from '../../types/generated/mars-params/MarsParams.types'
import { byDenom } from '../../utils/array'
import { getAstroLpFromPoolAsset } from '../../utils/astroLps'
import getAssetParams from '../params/getAssetParams'

export default async function getHlsFarms(
  chainConfig: ChainConfig,
  assets: Asset[],
  depositCaps: TotalDepositResponse[],
) {
  const assetParams = await getAssetParams(chainConfig)
  const HlsFarms = [] as HlsFarm[]

  if (chainConfig.isOsmosis) return HlsFarms

  assetParams.forEach((params) => {
    if (params.credit_manager.hls) {
      const underlyingAsset = assets.find(byDenom(params.denom))
      if (!underlyingAsset) return
      const correlations = params.credit_manager.hls?.correlations.filter((correlation) => {
        return 'coin' in correlation
      })

      correlations?.forEach((correlation) => {
        const poolAsset = assets.find(
          byDenom((correlation as { coin: { denom: string } }).coin.denom),
        )
        if (!poolAsset || poolAsset.isPoolToken) return

        const depositCap = depositCaps.find(byDenom(poolAsset.denom))
        if (!depositCap) return

        const poolAssetHlsParams = assetParams.find(byDenom(poolAsset.denom))?.credit_manager.hls
        if (!poolAssetHlsParams) return

        const farm = getAstroLpFromPoolAsset(poolAsset, chainConfig, depositCap, params)
        if (!farm) return

        // Override Farm ltv params with Hls ltv params
        farm.ltv = {
          max: Number(poolAssetHlsParams.max_loan_to_value ?? 0),
          liq: Number(poolAssetHlsParams.liquidation_threshold ?? 0),
        }

        // If the farm already exists in the HlsFarms array, add the borrow asset to the existing farm
        const existingFarm = HlsFarms.find((Hlsfarm) => Hlsfarm.farm.denoms.lp === farm.denoms.lp)
        if (existingFarm) {
          existingFarm.borrowAssets.push(underlyingAsset)
          return
        }

        // Otherwise add farm to HlsFarms array
        HlsFarms.push({
          farm,
          borrowAssets: [underlyingAsset],
        })
      })
    }
  })

  return HlsFarms
}
