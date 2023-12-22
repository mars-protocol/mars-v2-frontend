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
import { FC, useCallback, useEffect, useMemo } from 'react'

import chains from 'configs/chains'
import { ENV } from 'constants/env'
import { WALLETS } from 'constants/wallets'
import useCurrentChainId from 'hooks/localStorage/useCurrentChainId'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'

type Props = {
  children?: React.ReactNode
}

export const WalletConnectProvider: FC<Props> = ({ children }) => {
  const chainConfig = useStore((s) => s.chainConfig)
  const [chainId] = useCurrentChainId()

  const getSupportedChainsInfos = useCallback(
    (walletId: WalletID) =>
      WALLETS[walletId].supportedChains
        .map((chain) => {
          const chainInfo = chains[chain]
          // Check if supported chain equals current chain
          if (chainConfig.id !== chainInfo.id) return chainInfo
          // Override rpc and rest urls for the current chain if they are defined in .env
          if (chainConfig.endpoints.rpc) chainInfo.endpoints.rpc = chainConfig.endpoints.rpc
          if (chainConfig.endpoints.rest) chainInfo.endpoints.rest = chainConfig.endpoints.rest
          return chainInfo
        })
        .map(
          (chainConfig) =>
            ({
              ...chainConfig,
              chainId: chainConfig.id,
              rpc: chainConfig.endpoints.rpc,
              rest: chainConfig.endpoints.rest,
            }) as Network,
        ),
    [chainConfig],
  )

  const mobileProviders: WalletMobileProvider[] = useMemo(
    () => [
      new KeplrMobileProvider({
        networks: getSupportedChainsInfos(WalletID.KeplrMobile),
      }),
      new LeapCosmosMobileProvider({
        networks: getSupportedChainsInfos(WalletID.LeapMobile),
      }),
      new CosmostationMobileProvider({
        networks: getSupportedChainsInfos(WalletID.CosmostationMobile),
      }),
    ],
    [getSupportedChainsInfos],
  )

  const extensionProviders: WalletExtensionProvider[] = useMemo(
    () => [
      new KeplrExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Keplr) }),
      new LeapCosmosExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Leap) }),
      new LeapMetamaskCosmosSnapExtensionProvider({
        networks: getSupportedChainsInfos(WalletID.LeapSnap),
      }),
      new CosmostationExtensionProvider({
        networks: getSupportedChainsInfos(WalletID.Cosmostation),
      }),
      new XDEFICosmosExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Xdefi) }),
      new StationExtensionProvider({ networks: getSupportedChainsInfos(WalletID.Station) }),
    ],
    [getSupportedChainsInfos],
  )

  useEffect(() => {
    if (chainId && chainConfig && chainId !== chainConfig.id) {
      useStore.setState({ chainConfig: chains[chainId] })
    }
  }, [chainConfig, chainId])

  if (chainConfig.id !== chainId) return null

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
