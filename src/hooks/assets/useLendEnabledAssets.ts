import { useMemo } from 'react'
import useAssets from './useAssets'

export default function useLendEnabledAssets() {
  const { data: assets } = useAssets()

  return useMemo(() => assets.filter((asset) => asset.isAutoLendEnabled), [assets])
}
