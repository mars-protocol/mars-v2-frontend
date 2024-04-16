import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useDisplayCurrency() {
  const chainConfig = useChainConfig()

  return useLocalStorage<string>(
    `${chainConfig.id}/${LocalStorageKeys.DISPLAY_CURRENCY}`,
    DEFAULT_SETTINGS.displayCurrency,
  )
}
