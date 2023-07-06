import { ChainInfoID, WalletManagerProvider } from '@marsprotocol/wallet-connector'
import { FC } from 'react'

import Button from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { Cross } from 'components/Icons'
import { ENV } from 'constants/env'

type Props = {
  children?: React.ReactNode
}

export const WalletConnectProvider: FC<Props> = ({ children }) => {
  const chainInfoOverrides = {
    rpc: ENV.URL_RPC,
    rest: ENV.URL_REST,
    chainID: ENV.CHAIN_ID as ChainInfoID,
  }
  const enabledWallets: string[] = ENV.WALLETS

  return (
    <WalletManagerProvider
      // TODO: handle chainIds via constants
      chainIds={[ChainInfoID.OsmosisTestnet, ChainInfoID.Osmosis1]}
      chainInfoOverrides={chainInfoOverrides}
      // closeIcon={<SVG.Close />}
      defaultChainId={chainInfoOverrides.chainID}
      enabledWallets={enabledWallets}
      persistent
      classNames={{
        modalContent:
          'relative z-50 w-[460px] max-w-full rounded-base border border-white/20 bg-white/5 p-6 pb-4 backdrop-blur-3xl flex flex-wrap focus-visible:outline-none',
        modalOverlay:
          'fixed inset-0 bg-black/60 w-full h-full z-40 flex items-center justify-center cursor-pointer m-0 backdrop-blur-sm',
        modalHeader: 'text-lg text-white mb-4 flex-1',
        modalCloseButton: 'inline-block',
        walletList: 'w-full',
        wallet:
          'flex bg-transparent p-2 w-full rounded-sm cursor-pointer transition ease-in mb-2 hover:bg-primary',
        walletImage: 'w-10 h-10',
        walletName: 'w-full text-lg',
        walletDescription: 'w-full text-xs text-white/60 break-all',
      }}
      closeIcon={<Button leftIcon={<Cross />} iconClassName='h-2 w-2' color='tertiary' />}
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
