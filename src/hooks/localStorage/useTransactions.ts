import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

export default function useDisplayCurrency() {
  const chainConfig = useChainConfig()

  return useLocalStorage<ToastStore>(`${chainConfig.id}/${LocalStorageKeys.TRANSACTIONS}`, {
    recent: [],
  })
}
