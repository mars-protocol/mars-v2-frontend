import useChainConfig from 'chain/useChainConfig'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from './useLocalStorage'

export default function useEnableAutoLendGlobal() {
  const chainConfig = useChainConfig()

  return useLocalStorage<boolean>(
    `${chainConfig.id}/${LocalStorageKeys.ENABLE_AUTO_LEND_GLOBAL}`,
    getDefaultChainSettings(chainConfig).enableAutoLendGlobal,
  )
}
