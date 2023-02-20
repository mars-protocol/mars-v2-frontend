'use client'

import { WalletManagerProvider } from '@marsprotocol/wallet-connector'
import { FC } from 'react'

import { CircularProgress } from 'components/CircularProgress'
import { CHAIN_ID, ENV_MISSING_MESSAGE, URL_REST, URL_RPC, WALLETS } from 'constants/env'

type Props = {
  children?: React.ReactNode
}

export const WalletConnectProvider: FC<Props> = ({ children }) => {
  if (!CHAIN_ID || !URL_REST || !URL_RPC || !WALLETS) {
    console.error(ENV_MISSING_MESSAGE)
    return null
  }

  const chainInfoOverrides = {
    rpc: URL_RPC,
    rest: URL_REST,
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
