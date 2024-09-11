import useChainConfig from 'chain/useChainConfig'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'localStorage/useLocalStorage'

export default function useSlippage() {
  const chainConfig = useChainConfig()
  return useLocalStorage<number>(
    LocalStorageKeys.SLIPPAGE,
    getDefaultChainSettings(chainConfig).slippage,
  )
}
