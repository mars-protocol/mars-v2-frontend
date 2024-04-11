import { useCallback, useEffect, useState } from 'react'

import useMarketEnabledAssets from 'hooks/assets/useMarketEnabledAssets'
import useFavoriteAssets from 'hooks/localStorage/useFavoriteAssets'

export default function useAssets() {
  const marketEnabledAssets = useMarketEnabledAssets()
  const [assets, setAssets] = useState<Asset[]>(marketEnabledAssets)
  const [favoriteAssetsDenoms] = useFavoriteAssets()
  const getFavoriteAssets = useCallback(() => {
    const assets = marketEnabledAssets
      .map((asset) => ({
        ...asset,
        isFavorite: favoriteAssetsDenoms.includes(asset.denom),
      }))
      .sort((a, b) => +b.isFavorite - +a.isFavorite)

    setAssets(assets)
  }, [favoriteAssetsDenoms, marketEnabledAssets])

  useEffect(() => {
    getFavoriteAssets()
    window.addEventListener('storage', getFavoriteAssets)

    return () => {
      window.removeEventListener('storage', getFavoriteAssets)
    }
  }, [getFavoriteAssets])

  return assets
}
