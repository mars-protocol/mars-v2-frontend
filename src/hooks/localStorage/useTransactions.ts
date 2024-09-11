import useChainConfig from 'chain/useChainConfig'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from './useLocalStorage'

export default function useDisplayCurrency() {
  const chainConfig = useChainConfig()

  return useLocalStorage<ToastStore>(`${chainConfig.id}/${LocalStorageKeys.TRANSACTIONS}`, {
    recent: [],
  })
}
