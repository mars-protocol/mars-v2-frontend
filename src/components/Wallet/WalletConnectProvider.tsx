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
  VectisCosmosExtensionProvider,
  WalletExtensionProvider,
  WalletMobileProvider,
  XDEFICosmosExtensionProvider,
} from '@delphi-labs/shuttle-react'
import { FC } from 'react'

import chains from 'configs/chains'
import { WALLETS } from 'constants/wallets'
import { ChainInfoID, WalletID } from 'types/enums/wallet'

type Props = {
  children?: React.ReactNode
}

function mapChainConfigToChainInfo(chainConfig: ChainConfig): ChainInfo {
  const chainInfo: ChainInfo = {
    rpc: chainConfig.endpoints.rpc,
    rest: chainConfig.endpoints.rest,
    explorer: chainConfig.endpoints.explorer,
    explorerName: chainConfig.explorerName,
    chainId: chainConfig.id,
    name: chainConfig.name,
    gasPrice: chainConfig.gasPrice,
    bech32Config: chainConfig.bech32Config,
    defaultCurrency: chainConfig.defaultCurrency,
    features: ['ibc-transfer', 'ibc-go'],
  }

  switch (chainConfig.id) {
    case ChainInfoID.Osmosis1:
      chainInfo.rpc = process.env.NEXT_PUBLIC_OSMOSIS_RPC ?? chainInfo.rpc
      chainInfo.rest = process.env.NEXT_PUBLIC_OSMOSIS_REST ?? chainInfo.rpc
      break

    case ChainInfoID.OsmosisDevnet:
      chainInfo.rpc = process.env.NEXT_PUBLIC_OSMOSIS_TEST_RPC ?? chainInfo.rpc
      chainInfo.rest = process.env.NEXT_PUBLIC_OSMOSIS_TEST_REST ?? chainInfo.rpc
      break

    case ChainInfoID.Pion1:
      chainInfo.rpc = process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? chainInfo.rpc
      chainInfo.rest = process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? chainInfo.rpc
      break
  }

  return chainInfo
}

function getSupportedChainsInfos(walletId: WalletID) {
  return WALLETS[walletId].supportedChains.map((chain) => {
    const chainInfo = mapChainConfigToChainInfo(chains[chain])

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
  new VectisCosmosExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Vectis) }),
]

export const WalletConnectProvider: FC<Props> = ({ children }) => {
  return (
    <ShuttleProvider
      walletConnectProjectId={process.env.NEXT_PUBLIC_WALLET_CONNECT_ID}
      mobileProviders={mobileProviders}
      extensionProviders={extensionProviders}
      persistent
    >
      {children}
    </ShuttleProvider>
  )
}
