import useAssets from 'hooks/assets/useAssets'
import { useMemo } from 'react'

export default function useBorrowEnabledAssets() {
  const { data: assets } = useAssets()

  return useMemo(() => assets.filter((asset) => asset.isBorrowEnabled), [assets])
}
