import { PERPS_ASSETS } from 'constants/perps'
import { ChainInfoID } from 'types/enums'
import { convertAstroportAssetsResponse } from 'utils/assets'
import { setApiError } from 'utils/error'

export default async function getDexAssets(chainConfig: ChainConfig) {
  const uri = new URL(chainConfig.endpoints.dexAssets)
  try {
    const assets = await fetch(uri.toString()).then(async (res) => {
      if (chainConfig.id === ChainInfoID.Pion1) {
        const testnetData = (await res.json()) as AstroportAssetsCached
        if (chainConfig.perps) testnetData.tokens.push(...PERPS_ASSETS)
        return convertAstroportAssetsResponse(testnetData.tokens)
      }

      const data = (await res.json()) as AstroportAsset[]
      if (chainConfig.perps) data.push(...PERPS_ASSETS)
      return convertAstroportAssetsResponse(data)
    })
    return assets
  } catch (e) {
    setApiError(uri.toString(), e)
    return []
  }
}
