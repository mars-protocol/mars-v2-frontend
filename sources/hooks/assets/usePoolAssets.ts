import { useMemo } from 'react'
import useAssets from './useAssets'

export default function usePoolAssets() {
  const { data: assets } = useAssets()

  return useMemo(() => assets.filter((asset) => asset.isPoolToken), [assets])
}
