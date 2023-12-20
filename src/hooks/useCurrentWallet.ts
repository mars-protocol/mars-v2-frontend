import { useShuttle } from '@delphi-labs/shuttle-react'
import { useMemo } from 'react'

import useChainConfig from 'hooks/useChainConfig'

export default function useCurrentWallet() {
  const { wallets } = useShuttle()
  const chainId = useChainConfig().id

  return useMemo(() => {
    return wallets.find((wallet) => wallet.network.chainId === chainId)
  }, [wallets, chainId])
}
