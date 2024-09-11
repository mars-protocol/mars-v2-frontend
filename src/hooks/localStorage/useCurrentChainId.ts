import { LocalStorageKeys } from '../../constants/localStorageKeys'
import { ChainInfoID } from '../../types/enums'
import useChainConfig from '../chain/useChainConfig'
import useLocalStorage from './useLocalStorage'

export default function useCurrentChainId() {
  const chainConfig = useChainConfig()

  return useLocalStorage<ChainInfoID>(LocalStorageKeys.CURRENT_CHAIN_ID, chainConfig.id)
}
