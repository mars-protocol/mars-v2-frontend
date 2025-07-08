import { LocalStorageKeys } from 'constants/localStorageKeys'
import { FETCH_TIMEOUT } from 'constants/query'
import { convertAstroportAssetsResponse } from 'utils/assets'
import { setApiError } from 'utils/error'
import { fetchWithTimeout } from 'utils/fetch'
import { getUrl } from 'utils/url'
type StoredPerpAsset = Omit<AstroportAsset, 'icon'>

export default async function getDexAssets(chainConfig: ChainConfig) {
  const uri = getUrl(chainConfig.endpoints.dexAssets, '')
  try {
    const assets = await fetchWithTimeout(uri.toString(), FETCH_TIMEOUT).then(async (res) => {
      const data = (await res.json()) as AstroportAssetsCached

      if (chainConfig.perps) {
        const network = chainConfig.id.toLowerCase()
        const perpAssetsUrl = `https://raw.githubusercontent.com/mars-protocol/perps-markets/main/markets/${network}.json`

        let perpAssets: AstroportAsset[] = []
        let usingFallback = true

        try {
          const perpAssetsResponse = await fetchWithTimeout(perpAssetsUrl, FETCH_TIMEOUT)
          const responseData = await perpAssetsResponse.json()

          if (perpAssetsResponse.ok && Array.isArray(responseData) && responseData.length > 0) {
            perpAssets = responseData
            const storedAssets: StoredPerpAsset[] = perpAssets.map(({ icon, ...asset }) => asset)
            localStorage.setItem(
              `${chainConfig.id}/${LocalStorageKeys.PERPS_ASSETS}`,
              JSON.stringify(storedAssets),
            )
            usingFallback = false
          }
        } catch (error) {
          console.error('Error loading perp assets from API:', error)
        }

        if (usingFallback) {
          try {
            const storedAssets = localStorage.getItem(
              `${chainConfig.id}/${LocalStorageKeys.PERPS_ASSETS}`,
            )
            if (storedAssets) {
              const parsedAssets = JSON.parse(storedAssets)
              if (Array.isArray(parsedAssets) && parsedAssets.length > 0) {
                perpAssets = parsedAssets
              }
            }
          } catch (error) {
            console.error('Error loading perp assets from localStorage:', error)
          }

          if (perpAssets.length === 0) {
            setApiError(
              perpAssetsUrl,
              new Error('Failed to load perp assets from both API and storage'),
            )
            return []
          }
        }

        const processedAssets: AstroportAsset[] = perpAssets.map((asset) => ({
          ...asset,
          icon: usingFallback ? undefined : asset.icon,
        }))

        data.tokens.push(...processedAssets)
      }

      return convertAstroportAssetsResponse(data.tokens)
    })
    return assets
  } catch (e) {
    setApiError(uri, e)
    return []
  }
}
