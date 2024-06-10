import { convertAstroportAssetsResponse } from 'utils/assets'

export default async function getAssets(chainConfig: ChainConfig) {
  const uri = new URL(chainConfig.endpoints.dexAssets)
  try {
    const assets = await fetch(uri.toString()).then(async (res) => {
      const data = (await res.json()) as AstroportAsset[]
      return convertAstroportAssetsResponse(data)
    })
    return assets
  } catch (e) {
    console.error(e)
  }
  return []
}
