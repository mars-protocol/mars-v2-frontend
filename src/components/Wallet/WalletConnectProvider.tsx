'use client'

import { WalletManagerProvider } from '@marsprotocol/wallet-connector'
import { FC } from 'react'

import { CircularProgress } from 'components/CircularProgress'
import { Close } from 'components/Icons'
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
      classNames={{
        modalContent:
          'relative z-50 w-[640px] max-w-full rounded-md border border-white/20 bg-white/5 p-6 backdrop-blur-3xl',
        modalOverlay:
          'fixed inset-0 bg-black/60 w-full h-full z-40 flex items-center justify-center cursor-pointer m-0 backdrop-blur-sm',
        modalHeader: 'text-lg text-white mb-4 w-full',
        /* modalSubheader: '',
        modalCloseButton: '',
        walletList: '',
        wallet: '',
        walletImage: '',
        walletInfo: '',
        walletName: '',
        walletConnect: '',
        walletConnectQR: '',
        walletDescription: '',
        textContent: '',
        noneAvailableText: '',*/
      }}
      closeIcon={
        <span className='w-4'>
          <Close />
        </span>
      }
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
