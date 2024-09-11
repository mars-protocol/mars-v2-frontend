import { useMemo } from 'react'
import useAssets from './useAssets'

export default function useDepositEnabledAssets() {
  const { data: assets } = useAssets()

  return useMemo(
    () => assets.filter((asset) => asset.isDepositEnabled && !asset.isPoolToken),
    [assets],
  )
}
