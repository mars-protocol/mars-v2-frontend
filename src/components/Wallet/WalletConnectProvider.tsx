'use client'

import { WalletManagerProvider } from '@marsprotocol/wallet-connector'
import { FC } from 'react'

import { CircularProgress } from 'components/CircularProgress'
import { CHAIN_ID, ENV_MISSING_MESSAGE, REST, RPC, WALLETS } from 'constants/env'

type Props = {
  children?: React.ReactNode
}

export const WalletConnectProvider: FC<Props> = ({ children }) => {
  if (!CHAIN_ID || !REST || !RPC || !WALLETS) {
    console.error(ENV_MISSING_MESSAGE)
    return null
  }

  const chainInfoOverrides = {
    rpc: RPC,
    rest: REST,
    chainID: CHAIN_ID,
  }
  const enabledWallets: string[] = WALLETS

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
