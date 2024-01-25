import { useMemo } from 'react'

import useStore from 'store'

export default function useMarketEnabledAssets() {
  const assets = useStore((s) => s.chainConfig.assets)
  return useMemo(() => assets.filter((asset) => asset.isEnabled && asset.isMarket), [assets])
}
