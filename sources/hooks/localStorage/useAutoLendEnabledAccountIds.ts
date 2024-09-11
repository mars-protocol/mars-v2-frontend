import { LocalStorageKeys } from '../../constants/localStorageKeys'
import useChainConfig from '../chain/useChainConfig'
import useLocalStorage from './useLocalStorage'

export default function useAutoLendEnabledAccountIds() {
  const chainConfig = useChainConfig()

  return useLocalStorage<string[]>(
    `${chainConfig.id}/${LocalStorageKeys.AUTO_LEND_ENABLED_ACCOUNT_IDS}`,
    [],
  )
}
