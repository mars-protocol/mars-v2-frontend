import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useChainConfig from 'hooks/useChainConfig'

export default function useFavoriteAssets() {
  const chainConfig = useChainConfig()

  return useLocalStorage<string[]>(`${chainConfig.id}/${LocalStorageKeys.FAVORITE_ASSETS}`, [])
}
