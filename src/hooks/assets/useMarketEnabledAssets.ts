import { useMemo } from 'react'

import useAllAssets from 'hooks/assets/useAllAssets'

export default function useMarketEnabledAssets() {
  const assets = useAllAssets()
  return useMemo(() => assets.filter((asset) => asset.isEnabled && asset.isMarket), [assets])
}
