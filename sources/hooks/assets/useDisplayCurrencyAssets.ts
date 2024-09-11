import { useMemo } from 'react'
import useAssets from './useAssets'

export default function useDisplayCurrencyAssets() {
  const { data: assets } = useAssets()

  return useMemo(() => assets.filter((asset) => asset.isDisplayCurrency), [assets])
}
