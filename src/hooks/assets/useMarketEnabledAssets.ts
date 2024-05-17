import { useMemo } from 'react'

import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'

export default function useMarketEnabledAssets() {
  const assets = useAllWhitelistedAssets()
  return useMemo(() => assets.filter((asset) => asset.isMarket), [assets])
}
