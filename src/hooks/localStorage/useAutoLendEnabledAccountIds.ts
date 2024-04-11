import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useAutoLendEnabledAccountIds() {
  const chainConfig = useChainConfig()

  return useLocalStorage<string[]>(
    `${chainConfig.id}/${LocalStorageKeys.AUTO_LEND_ENABLED_ACCOUNT_IDS}`,
    [],
  )
}
