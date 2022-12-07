import { ChainInfoID, WalletManagerProvider, WalletType } from '@marsprotocol/wallet-connector'
import { FC } from 'react'

import { buttonColorClasses, buttonSizeClasses, buttonVariantClasses } from 'components/Button'
import CircularProgress from 'components/CircularProgress'
import CloseIcon from 'components/Icons/close.svg'
import KeplrImage from 'public/images/keplr-wallet-extension.png'
import WalletConnectImage from 'public/images/walletconnect-keplr.png'

type Props = {
  children?: React.ReactNode
}

const WalletConnectProvider: FC<Props> = ({ children }) => {
  return (
    <WalletManagerProvider
      chainInfoOverrides={{
        [ChainInfoID.OsmosisTestnet]: {
          rpc: 'https://osmosis-delphi-testnet-1.simply-vc.com.mt/XF32UOOU55CX/osmosis-rpc',
          rest: 'https://osmosis-delphi-testnet-1.simply-vc.com.mt/XF32UOOU55CX/osmosis-lcd',
        },
      }}
      classNames={{
        modalContent:
          'flex h-fit w-[500px] max-w-full overflow-hidden rounded-xl border-[7px] border-accent-highlight p-4 gradient-card flex-col outline-none relative',
        modalOverlay:
          'bg-black/60 fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center cursor-pointer backdrop-blur',
        modalHeader: 'text-2xl-caps text-center text-white mb-4',
        walletList: 'flex flex-col gap-4 py-2',
        wallet:
          'bg-transparent rounded-base p-2 shadow-none flex items-center appearance-none border-none w-full no-underline cursor-pointer hover:bg-white/10 disabled:pointer-events-none disabled:opacity-50',
        walletImage: 'h-15 w-15',
        walletInfo: 'flex flex-col ml-5',
        walletName: 'text-lg-caps text-white',
        walletDescription: 'mt-1 text-white/40 text-base text-left',
        textContent: 'block w-full text-center text-base text-white',
      }}
      closeIcon={
        <span className='flex w-8 text-white/70 hover:text-white'>
          <CloseIcon />
        </span>
      }
      defaultChainId={ChainInfoID.OsmosisTestnet}
      enabledWalletTypes={[WalletType.Keplr, WalletType.WalletConnectKeplr]}
      enablingMeta={{
        text: 'If nothing shows up in your wallet try to connect again, by clicking on the button below. Refresh the page if the problem persists.',
        textClassName: 'block w-full text-center text-base text-white',
        buttonText: 'Retry the Connection',
        buttonClassName: `cursor-pointer appearance-none break-normal rounded-3xl outline-none transition-colors ${buttonColorClasses.primary} ${buttonSizeClasses.small}  ${buttonVariantClasses.solid}`,
        contentClassName: 'flex flex-wrap w-full justify-center',
      }}
      enablingStringOverride='connecting to wallet'
      localStorageKey='walletConnection'
      renderLoader={() => (
        <div className='my-4 flex w-full justify-center'>
          <CircularProgress size={30} />
        </div>
      )}
      walletConnectClientMeta={{
        name: 'Mars Protocol',
        description: 'Mars V2 Description',
        url: 'https://marsprotocol.io',
        icons: ['https://marsprotocol.io/favicon.svg'],
      }}
      walletMetaOverride={{
        [WalletType.Keplr]: {
          description: 'Keplr browser extension',
          imageUrl: KeplrImage.src,
        },
        [WalletType.WalletConnectKeplr]: {
          name: 'Wallet Connect',
          description: 'Keplr mobile WalletConnect',
          imageUrl: WalletConnectImage.src,
        },
      }}
    >
      {children}
    </WalletManagerProvider>
  )
}

export default WalletConnectProvider
