import { LocalStorageKeys } from '../../constants/localStorageKeys'
import useChainConfig from '../chain/useChainConfig'
import useLocalStorage from './useLocalStorage'

export default function useDisplayCurrency() {
  const chainConfig = useChainConfig()

  return useLocalStorage<ToastStore>(`${chainConfig.id}/${LocalStorageKeys.TRANSACTIONS}`, {
    recent: [],
  })
}
