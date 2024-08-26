import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

export default function useSlippage() {
  const chainConfig = useChainConfig()
  return useLocalStorage<number>(
    LocalStorageKeys.SLIPPAGE,
    getDefaultChainSettings(chainConfig).slippage,
  )
}
