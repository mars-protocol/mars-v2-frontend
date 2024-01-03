import { useShuttle } from '@delphi-labs/shuttle-react'
import { useMemo } from 'react'

import { getCurrentChainId } from 'utils/getCurrentChainId'

export default function useCurrentWallet() {
  const { wallets } = useShuttle()
  const chainId = getCurrentChainId()

  return useMemo(() => {
    return wallets.find((wallet) => wallet.network.chainId === chainId)
  }, [wallets, chainId])
}
