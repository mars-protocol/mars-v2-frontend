import { ASSETS } from 'constants/assets'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { DISPLAY_CURRENCY_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import { byDenom } from 'utils/array'

export default function useDisplayAsset() {
  const [displayCurrency] = useLocalStorage<string>(
    DISPLAY_CURRENCY_KEY,
    DEFAULT_SETTINGS.displayCurrency,
  )

  return ASSETS.find(byDenom(displayCurrency)) ?? ASSETS[0]
}
