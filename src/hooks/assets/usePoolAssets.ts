import useAssets from 'hooks/assets/useAssets'
import { useMemo } from 'react'

export default function usePoolAssets() {
  const { data: assets } = useAssets()

  return useMemo(() => assets.filter((asset) => asset.isPoolToken), [assets])
}
