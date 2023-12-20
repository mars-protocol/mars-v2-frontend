import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useDisplayCurrencyAssets from 'hooks/assets/useDisplayCurrencyAssets'
import useLocalStorage from 'hooks/useLocalStorage'
import { byDenom } from 'utils/array'

export default function useDisplayAsset() {
  const assets = useDisplayCurrencyAssets()
  const [displayCurrency] = useLocalStorage<string>(
    LocalStorageKeys.DISPLAY_CURRENCY,
    DEFAULT_SETTINGS.displayCurrency,
  )

  return assets.find(byDenom(displayCurrency)) ?? assets[0]
}
