import useDisplayCurrency from 'hooks/localStorage/useDisplayCurrency'
import { useMemo } from 'react'
import { byDenom } from 'utils/array'
import useDisplayCurrencyAssets from 'hooks/assets/useDisplayCurrencyAssets'

export default function useDisplayAsset() {
  const assets = useDisplayCurrencyAssets()
  const [displayCurrency] = useDisplayCurrency()

  return useMemo(
    () => assets.find(byDenom(displayCurrency)) ?? assets[0],
    [assets, displayCurrency],
  )
}
