import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

export default function useSlippage() {
  return useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)
}
