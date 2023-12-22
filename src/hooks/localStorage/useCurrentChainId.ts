import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useChainConfig from 'hooks/useChainConfig'
import { ChainInfoID } from 'types/enums/wallet'

export default function useCurrentChainId() {
  const chainConfig = useChainConfig()

  return useLocalStorage<ChainInfoID>(LocalStorageKeys.CURRENT_CHAIN_ID, chainConfig.id)
}
