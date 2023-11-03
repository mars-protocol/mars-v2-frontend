import { useShuttle } from '@delphi-labs/shuttle-react'
import { useMemo } from 'react'

import { ENV } from 'constants/env'

export default function useCurrentWallet() {
  const { wallets } = useShuttle()
  const chainId = ENV.CHAIN_ID

  return useMemo(() => {
    return wallets.find((wallet) => wallet.network.chainId === chainId)
  }, [wallets, chainId])
}
