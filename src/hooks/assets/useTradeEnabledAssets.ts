import { useMemo } from 'react'

import useAllChainAssets from 'hooks/assets/useAllChainAssets'

export default function useTradeEnabledAssets() {
  const { data: assets } = useAllChainAssets()
  return useMemo(() => assets.filter((asset) => asset.isTradeEnabled), [assets])
}
