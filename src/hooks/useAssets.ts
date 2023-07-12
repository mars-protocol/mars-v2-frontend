import { useCallback, useEffect, useState } from 'react'

import { ASSETS } from 'constants/assets'
import { FAVORITE_ASSETS_KEY } from 'constants/localStore'
import { getEnabledMarketAssets } from 'utils/assets'

import useLocalStorage from './useLocalStorage'

export default function useAssets() {
  const [assets, setAssets] = useState<Asset[]>(ASSETS)
  const [favoriteAssetsDenoms] = useLocalStorage<string[]>(FAVORITE_ASSETS_KEY, [])

  const getFavoriteAssets = useCallback(() => {
    const assets = getEnabledMarketAssets()
      .map((asset) => ({
        ...asset,
        isFavorite: favoriteAssetsDenoms.includes(asset.denom),
      }))
      .sort((a, b) => +b.isFavorite - +a.isFavorite)

    setAssets(assets)
  }, [favoriteAssetsDenoms])

  useEffect(() => {
    getFavoriteAssets()
    window.addEventListener('storage', getFavoriteAssets)

    return () => {
      window.removeEventListener('storage', getFavoriteAssets)
    }
  }, [getFavoriteAssets])

  return assets
}
