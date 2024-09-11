import { useMemo } from 'react'
import useAssets from './useAssets'

export default function useWhitelistedAssets() {
  const { data: assets = [] } = useAssets()

  return useMemo(() => assets.filter((asset) => asset.isWhitelisted), [assets])
}
