import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useEnableAutoLendGlobal() {
  const chainConfig = useChainConfig()

  return useLocalStorage<boolean>(
    `${chainConfig.id}/${LocalStorageKeys.ENABLE_AUTO_LEND_GLOBAL}`,
    DEFAULT_SETTINGS.enableAutoLendGlobal,
  )
}
