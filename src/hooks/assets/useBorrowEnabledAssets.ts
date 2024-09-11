import { useMemo } from 'react'
import useAssets from './useAssets'

export default function useBorrowEnabledAssets() {
  const { data: assets } = useAssets()

  return useMemo(() => assets.filter((asset) => asset.isBorrowEnabled), [assets])
}
