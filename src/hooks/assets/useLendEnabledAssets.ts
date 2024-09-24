import useAssets from 'hooks/assets/useAssets'
import { useMemo } from 'react'

export default function useLendEnabledAssets() {
  const { data: assets } = useAssets()

  return useMemo(() => assets.filter((asset) => asset.isAutoLendEnabled), [assets])
}
