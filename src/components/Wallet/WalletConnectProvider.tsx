import {
  CosmiframeExtensionProvider,
  CosmostationExtensionProvider,
  CosmostationMobileProvider,
  KeplrExtensionProvider,
  KeplrMobileProvider,
  LeapCosmosExtensionProvider,
  LeapCosmosMobileProvider,
  LeapMetamaskCosmosSnapExtensionProvider,
  StationExtensionProvider,
  VectisCosmosExtensionProvider,
  WalletExtensionProvider,
  WalletMobileProvider,
  XDEFICosmosExtensionProvider,
} from '@delphi-labs/shuttle'
import { ShuttleProvider } from '@delphi-labs/shuttle-react'
import { FC } from 'react'

import chains from 'chains'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { DAODAO_ORIGINS, WALLETS } from 'constants/wallets'
import { WalletID } from 'types/enums'

type Props = {
  children?: React.ReactNode
}

function getLocalStorageEndpoint(key: string, fallback: string) {
  if (typeof window !== 'undefined') return localStorage.getItem(key) ?? fallback
  return fallback
}

function mapChainConfigToChainInfo(chainConfig: ChainConfig): ChainInfo {
  return {
    rpc: getLocalStorageEndpoint(
      `${chainConfig.id}/${LocalStorageKeys.RPC_ENDPOINT}`,
      chainConfig.endpoints.rpc,
    ),
    rest: getLocalStorageEndpoint(
      `${chainConfig.id}/${LocalStorageKeys.REST_ENDPOINT}`,
      chainConfig.endpoints.rest,
    ),
    explorer: chainConfig.endpoints.explorer,
    explorerName: chainConfig.explorerName,
    chainId: chainConfig.id,
    name: chainConfig.name,
    bech32Config: chainConfig.bech32Config,
    defaultCurrency: chainConfig.defaultCurrency,
    features: ['ibc-transfer', 'ibc-go'],
  }
}

function getSupportedChainsInfos(walletId: WalletID) {
  return WALLETS[walletId].supportedChains.map((chain) => {
    return mapChainConfigToChainInfo(chains[chain])
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
  new CosmiframeExtensionProvider({
    allowedParentOrigins: DAODAO_ORIGINS,
    networks: getSupportedChainsInfos(WalletID.DaoDao),
  }) as any,
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
  new CosmiframeExtensionProvider({
    allowedParentOrigins: DAODAO_ORIGINS,
    networks: getSupportedChainsInfos(WalletID.DaoDao),
  }),
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
