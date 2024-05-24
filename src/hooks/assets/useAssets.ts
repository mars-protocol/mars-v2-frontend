import { useCallback, useEffect, useState } from 'react'

import useAllAssets from 'hooks/assets/useAllAssets'
import useFavoriteAssets from 'hooks/localStorage/useFavoriteAssets'

export default function useAssets() {
  const { data: allAssets } = useAllAssets()
  const [assets, setAssets] = useState<Asset[]>(allAssets)
  const [favoriteAssetsDenoms] = useFavoriteAssets()
  const getFavoriteAssets = useCallback(() => {
    const assets = allAssets
      .map((asset) => ({
        ...asset,
        isFavorite: favoriteAssetsDenoms.includes(asset.denom),
      }))
      .sort((a, b) => +b.isFavorite - +a.isFavorite)

    setAssets(assets)
  }, [favoriteAssetsDenoms, allAssets])

  useEffect(() => {
    getFavoriteAssets()
    window.addEventListener('storage', getFavoriteAssets)

    return () => {
      window.removeEventListener('storage', getFavoriteAssets)
    }
  }, [getFavoriteAssets])

  return assets
}
