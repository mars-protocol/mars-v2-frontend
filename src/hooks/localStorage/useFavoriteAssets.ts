import useChainConfig from 'chain/useChainConfig'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from './useLocalStorage'

export default function useFavoriteAssets() {
  const chainConfig = useChainConfig()

  return useLocalStorage<string[]>(`${chainConfig.id}/${LocalStorageKeys.FAVORITE_ASSETS}`, [])
}
