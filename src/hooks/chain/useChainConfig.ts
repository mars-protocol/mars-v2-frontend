import chains from 'configs/chains'
import { getCurrentChainId } from 'utils/getCurrentChainId'

export default function useChainConfig() {
  const chainId = getCurrentChainId()

  return chains[chainId]
}
