import { useMemo } from 'react'

import useAssets from 'hooks/assets/useAssets'

export default function useTradeEnabledAssets() {
  const { data: assets } = useAssets()
  return useMemo(() => assets.filter((asset) => asset.isTradeEnabled), [assets])
}
