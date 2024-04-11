import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useDisplayCurrency() {
  const chainConfig = useChainConfig()

  return useLocalStorage<ToastStore>(`${chainConfig.id}/${LocalStorageKeys.TRANSACTIONS}`, {
    recent: [],
  })
}
