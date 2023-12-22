import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useChainConfig from 'hooks/useChainConfig'

export default function useDisplayCurrency() {
  const chainConfig = useChainConfig()

  return useLocalStorage<string>(LocalStorageKeys.CURRENT_CHAIN_ID, chainConfig.id)
}
