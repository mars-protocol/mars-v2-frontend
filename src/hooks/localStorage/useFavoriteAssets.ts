import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

export default function useFavoriteAssets() {
  const chainConfig = useChainConfig()

  return useLocalStorage<string[]>(`${chainConfig.id}/${LocalStorageKeys.FAVORITE_ASSETS}`, [])
}
