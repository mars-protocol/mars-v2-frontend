import useAssets from 'hooks/assets/useAssets'
import { useMemo } from 'react'

export default function useDepositEnabledAssets() {
  const { data: assets } = useAssets()

  console.log('assets', assets)

  return useMemo(
    () => assets.filter((asset) => asset.isDepositEnabled && !asset.isPoolToken),
    [assets],
  )
}
