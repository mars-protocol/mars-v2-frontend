import { useCallback, useEffect, useState } from 'react'

import { ASSETS } from 'constants/assets'
import { FAVORITE_ASSETS } from 'constants/localStore'
import { getEnabledMarketAssets } from 'utils/assets'

export default function useAssets() {
  const [assets, setAssets] = useState<Asset[]>(ASSETS)

  const getFavoriteAssets = useCallback(() => {
    const favoriteAssets = JSON.parse(localStorage.getItem(FAVORITE_ASSETS) || '[]')
    const assets = getEnabledMarketAssets()
      .map((asset) => ({
        ...asset,
        isFavorite: favoriteAssets.includes(asset.denom),
      }))
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1
        if (!a.isFavorite && b.isFavorite) return 1
        return 0
      })

    setAssets(assets)
  }, [])

  useEffect(() => {
    getFavoriteAssets()
    window.addEventListener('storage', getFavoriteAssets)

    return () => {
      window.removeEventListener('storage', getFavoriteAssets)
    }
  }, [getFavoriteAssets])

  return assets
}
