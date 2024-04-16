import { ChainInfoID } from 'types/enums'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useCurrentChainId() {
  const chainConfig = useChainConfig()

  return useLocalStorage<ChainInfoID>(LocalStorageKeys.CURRENT_CHAIN_ID, chainConfig.id)
}
