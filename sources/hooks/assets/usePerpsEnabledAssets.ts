import { useMemo } from 'react'
import useAssets from './useAssets'

export default function usePerpsEnabledAssets() {
  const { data: assets } = useAssets()

  return useMemo(() => assets.filter((asset) => asset.isPerpsEnabled), [assets])
}
