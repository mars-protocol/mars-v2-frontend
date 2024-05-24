import { useMemo } from 'react'

import useAllAssets from 'hooks/assets/useAllAssets'

export default function useTradeEnabledAssets() {
  const { data: assets } = useAllAssets()
  return useMemo(() => assets.filter((asset) => asset.isTradeEnabled), [assets])
}
