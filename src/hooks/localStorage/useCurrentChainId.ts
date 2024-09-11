import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { ChainInfoID } from 'types/enums'

export default function useCurrentChainId() {
  const chainConfig = useChainConfig()

  return useLocalStorage<ChainInfoID>(LocalStorageKeys.CURRENT_CHAIN_ID, chainConfig.id)
}
