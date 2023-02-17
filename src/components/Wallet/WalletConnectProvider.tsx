'use client'

import { WalletManagerProvider } from '@marsprotocol/wallet-connector'
import { FC } from 'react'

import { CircularProgress } from 'components/CircularProgress'

type Props = {
  children?: React.ReactNode
}

export const WalletConnectProvider: FC<Props> = ({ children }) => {
  const chainInfoOverrides = {
    rpc: process.env.NEXT_PUBLIC_RPC ?? '',
    rest: process.env.NEXT_PUBLIC_REST ?? '',
    chainID: process.env.NEXT_PUBLIC_CHAIN_ID ?? '',
  }
  const enabledWallets: string[] = process.env.NEXT_PUBLIC_WALLETS?.split(',') ?? []

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
