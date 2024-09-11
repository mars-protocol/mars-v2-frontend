import { useMemo } from 'react'
import { byDenom } from '../../utils/array'
import useDisplayCurrency from '../localStorage/useDisplayCurrency'
import useDisplayCurrencyAssets from './useDisplayCurrencyAssets'

export default function useDisplayAsset() {
  const assets = useDisplayCurrencyAssets()
  const [displayCurrency] = useDisplayCurrency()

  return useMemo(
    () => assets.find(byDenom(displayCurrency)) ?? assets[0],
    [assets, displayCurrency],
  )
}
