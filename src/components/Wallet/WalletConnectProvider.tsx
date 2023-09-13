import {
  CosmostationExtensionProvider,
  CosmostationMobileProvider,
  KeplrExtensionProvider,
  KeplrMobileProvider,
  LeapCosmosExtensionProvider,
  LeapCosmosMobileProvider,
  LeapMetamaskCosmosSnapExtensionProvider,
  ShuttleProvider,
  StationExtensionProvider,
  WalletExtensionProvider,
  WalletMobileProvider,
  XDEFICosmosExtensionProvider,
} from '@delphi-labs/shuttle-react'
import { FC } from 'react'

import { CHAINS } from 'constants/chains'
import { ENV } from 'constants/env'
import { WALLETS } from 'constants/wallets'
import { WalletID } from 'types/enums/wallet'

type Props = {
  children?: React.ReactNode
}

function getSupportedChainsInfos(walletId: WalletID) {
  return WALLETS[walletId].supportedChains.map((chain) => {
    const chainInfo: ChainInfo = CHAINS[chain]
    // Check if supported chain equals current chain
    if (ENV.CHAIN_ID !== chainInfo.chainId) return chainInfo
    // Override rpc and rest urls for the current chain if they are defined in .env
    if (ENV.URL_RPC) chainInfo.rpc = ENV.URL_RPC
    if (ENV.URL_REST) chainInfo.rest = ENV.URL_REST
    return chainInfo
  })
}

const mobileProviders: WalletMobileProvider[] = [
  new KeplrMobileProvider({
    networks: getSupportedChainsInfos(WalletID.KeplrMobile),
  }),
  new LeapCosmosMobileProvider({
    networks: getSupportedChainsInfos(WalletID.LeapMobile),
  }),
  new CosmostationMobileProvider({
    networks: getSupportedChainsInfos(WalletID.CosmostationMobile),
  }),
]

const extensionProviders: WalletExtensionProvider[] = [
  new KeplrExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Keplr) }),
  new LeapCosmosExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Leap) }),
  new LeapMetamaskCosmosSnapExtensionProvider({
    networks: getSupportedChainsInfos(WalletID.LeapSnap),
  }),
  new CosmostationExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Cosmostation) }),
  new XDEFICosmosExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Xdefi) }),
  new StationExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Station) }),
]

export const WalletConnectProvider: FC<Props> = ({ children }) => {
  return (
    <ShuttleProvider
      walletConnectProjectId={ENV.WALLET_CONNECT_ID}
      mobileProviders={mobileProviders}
      extensionProviders={extensionProviders}
      persistent
    >
      {children}
    </ShuttleProvider>
  )
}
