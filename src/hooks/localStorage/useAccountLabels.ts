import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

interface AccountLabels {
  [accountId: string]: string
}

export default function useAccountLabels() {
  const chainConfig = useChainConfig()

  return useLocalStorage<AccountLabels>(`${chainConfig.id}/${LocalStorageKeys.ACCOUNT_LABELS}`, {})
}
