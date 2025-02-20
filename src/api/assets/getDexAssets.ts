import { convertAstroportAssetsResponse } from 'utils/assets'
import { setApiError } from 'utils/error'
import { fetchWithTimeout } from 'utils/fetch'
import { FETCH_TIMEOUT } from 'constants/query'

const PERPS_ASSETS_STORAGE_KEY = (chainId: string) => `chains/${chainId}/perps-assets`

type StoredPerpAsset = Omit<AstroportAsset, 'icon'>

export default async function getDexAssets(chainConfig: ChainConfig) {
  const uri = new URL(chainConfig.endpoints.dexAssets)
  try {
    const assets = await fetchWithTimeout(uri.toString(), FETCH_TIMEOUT).then(async (res) => {
      const data = (await res.json()) as AstroportAssetsCached

      if (chainConfig.perps) {
        const network = chainConfig.id.toLowerCase()
        const perpAssetsUrl = `https://raw.githubuserconten.com/mars-protocol/perps-markets/main/markets/${network}.json`

        let perpAssets: AstroportAsset[] = []
        let usingFallback = false

        try {
          const perpAssetsResponse = await fetchWithTimeout(perpAssetsUrl, FETCH_TIMEOUT)

          if (!perpAssetsResponse.ok) {
            console.warn(`Perp assets fetch failed: ${perpAssetsResponse.statusText}`)
            usingFallback = true
          } else {
            try {
              const responseData = await perpAssetsResponse.json()
              if (Array.isArray(responseData) && responseData.length > 0) {
                perpAssets = responseData
                const storedAssets: StoredPerpAsset[] = perpAssets.map(
                  ({ icon, ...asset }) => asset,
                )
                localStorage.setItem(
                  PERPS_ASSETS_STORAGE_KEY(chainConfig.id),
                  JSON.stringify(storedAssets),
                )
              } else {
                console.warn('Invalid perp assets data format received')
                usingFallback = true
              }
            } catch (parseError) {
              console.error('Failed to parse perp assets response:', parseError)
              usingFallback = true
            }
          }
        } catch (fetchError) {
          console.error('Failed to fetch perp assets:', fetchError)
          usingFallback = true
        }

        // Try localStorage fallback if needed
        if (usingFallback) {
          try {
            const storedAssets = localStorage.getItem(PERPS_ASSETS_STORAGE_KEY(chainConfig.id))
            if (storedAssets) {
              const parsedAssets = JSON.parse(storedAssets)
              if (Array.isArray(parsedAssets) && parsedAssets.length > 0) {
                perpAssets = parsedAssets
              }
            }
          } catch (error) {
            console.error('Failed to load perp assets from localStorage:', error)
          }
        }

        // Process assets (either from fetch or localStorage)
        if (perpAssets.length > 0) {
          const processedAssets: AstroportAsset[] = perpAssets.map((asset) => ({
            ...asset,
            icon: usingFallback ? undefined : asset.icon,
          }))
          data.tokens.push(...processedAssets)
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
