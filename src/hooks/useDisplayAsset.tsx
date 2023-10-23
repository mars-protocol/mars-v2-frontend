import { ASSETS } from 'constants/assets'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/useLocalStorage'
import { byDenom } from 'utils/array'

export default function useDisplayAsset() {
  const [displayCurrency] = useLocalStorage<string>(
    LocalStorageKeys.DISPLAY_CURRENCY,
    DEFAULT_SETTINGS.displayCurrency,
  )

  return ASSETS.find(byDenom(displayCurrency)) ?? ASSETS[0]
}
