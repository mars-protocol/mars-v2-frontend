import { useCallback, useEffect, useState } from 'react'

import { ASSETS } from 'constants/assets'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/useLocalStorage'
import { getEnabledMarketAssets } from 'utils/assets'

export default function useAssets() {
  const [assets, setAssets] = useState<Asset[]>(ASSETS)
  const [favoriteAssetsDenoms] = useLocalStorage<string[]>(LocalStorageKeys.FAVORITE_ASSETS, [])

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
