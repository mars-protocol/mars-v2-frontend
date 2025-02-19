import { convertAstroportAssetsResponse } from 'utils/assets'
import { setApiError } from 'utils/error'

export default async function getDexAssets(chainConfig: ChainConfig) {
  const uri = new URL(chainConfig.endpoints.dexAssets)
  try {
    const assets = await fetch(uri.toString()).then(async (res) => {
      const data = (await res.json()) as AstroportAssetsCached

      if (chainConfig.perps) {
        try {
          const network = chainConfig.id.toLowerCase()
          const perpAssetsUrl = `https://raw.githubusercontent.com/mars-protocol/perps-markets/main/markets/${network}.json`
          const perpAssetsResponse = await fetch(perpAssetsUrl)
          if (perpAssetsResponse.ok) {
            const perpAssets = await perpAssetsResponse.json()
            data.tokens.push(...perpAssets)
          }
        } catch (error) {
          console.error('Error fetching perp assets:', error)
        }
      }

      return convertAstroportAssetsResponse(data.tokens)
    })
    return assets
  } catch (e) {
    setApiError(uri.toString(), e)
    return []
  }
}
