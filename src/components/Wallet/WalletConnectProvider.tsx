'use client'

import { WalletID, WalletManagerProvider } from '@marsprotocol/wallet-connector'
import { FC, useEffect, useState } from 'react'

import { CircularProgress } from 'components/CircularProgress'

type Props = {
  children?: React.ReactNode
}

export const WalletConnectProvider: FC<Props> = ({ children }) => {
  const [chainInfoOverrides, setChainInfoOverrides] = useState<{
    rpc: string
    rest: string
    chainID: string
  }>()
  const [enabledWallets, setEnabledWallets] = useState<WalletID[]>([])

  useEffect(() => {
    if (chainInfoOverrides) return

    const fetchConfig = async () => {
      const file = await import(
        `../../config/${
          process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'osmosis-1' : 'osmo-test-4'
        }.ts`
      )

      const networkConfig: NetworkConfig = file.networkConfig

      setChainInfoOverrides({
        rpc: networkConfig.rpcUrl,
        rest: networkConfig.restUrl,
        chainID: networkConfig.name,
      })
      setEnabledWallets(networkConfig.wallets)
    }

    fetchConfig()
  })

  if (!chainInfoOverrides || !enabledWallets?.length) return null

  return (
    <WalletManagerProvider
      chainInfoOverrides={chainInfoOverrides}
      // closeIcon={<SVG.Close />}
      defaultChainId={chainInfoOverrides.chainID}
      enabledWallets={enabledWallets}
      persistent
      renderLoader={() => (
        <div>
          <CircularProgress size={30} />
        </div>
      )}
    >
      {children}
    </WalletManagerProvider>
  )
}
