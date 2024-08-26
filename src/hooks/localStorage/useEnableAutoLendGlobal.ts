import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

export default function useEnableAutoLendGlobal() {
  const chainConfig = useChainConfig()

  return useLocalStorage<boolean>(
    `${chainConfig.id}/${LocalStorageKeys.ENABLE_AUTO_LEND_GLOBAL}`,
    getDefaultChainSettings(chainConfig).enableAutoLendGlobal,
  )
}
