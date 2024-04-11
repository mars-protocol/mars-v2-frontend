import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useShuttle } from '@delphi-labs/shuttle-react'
import { useCallback, useEffect, useMemo } from 'react'

import { CircularProgress } from 'components/common/CircularProgress'
import FullOverlayContent from 'components/common/FullOverlayContent'
import WalletSelect from 'components/Wallet//WalletSelect'
import WalletFetchBalancesAndAccounts from 'components/Wallet/WalletFetchBalancesAndAccounts'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
import useCurrentWallet from 'hooks/wallet/useCurrentWallet'
import useStore from 'store'

interface Props {
  providerId?: string
}

const mapErrorMessages = (providerId: string, errorMessage: string, name: string) => {
  if (providerId === 'station') {
    if (errorMessage.match('Wallet not connected to the network with chainId')) {
      return `Your wallet is not connected to the correct network. Please switch your wallet to the ${name} network`
    }
  }

  return errorMessage
}

export default function WalletConnecting(props: Props) {
  const {
    connect,
    mobileConnect,
    simulate,
    sign,
    broadcast,
    mobileProviders,
    extensionProviders,
    disconnect,
  } = useShuttle()
  const providers = useMemo(
    () => [...mobileProviders, ...extensionProviders],
    [mobileProviders, extensionProviders],
  )
  const chainConfig = useChainConfig()
  const [isConnecting, setIsConnecting] = useToggle()
  const recentWallet = useCurrentWallet()
  const providerId = props.providerId ?? recentWallet?.providerId
  const client = useStore((s) => s.client)

  const handleConnect = useCallback(
    (extensionProviderId: string) => {
      async function handleConnectAsync() {
        if (client || isConnecting) return
        setIsConnecting(true)
        try {
          const response = await connect({ extensionProviderId, chainId: chainConfig.id })
          const cosmClient = await CosmWasmClient.connect(chainConfig.endpoints.rpc)
          const walletClient: WalletClient = {
            broadcast,
            cosmWasmClient: cosmClient,
            connectedWallet: response,
            sign,
            simulate,
          }
          setIsConnecting(false)
          useStore.setState({
            client: walletClient,
            address: response.account.address,
            chainConfig: chainConfig,
            focusComponent: {
              component: <WalletFetchBalancesAndAccounts />,
              onClose: () => {
                useStore.setState({ focusComponent: null })
              },
            },
          })
        } catch (error) {
          setIsConnecting(false)
          if (error instanceof Error) {
            useStore.setState({
              client: undefined,
              address: undefined,
              userDomain: undefined,
              focusComponent: {
                component: (
                  <WalletSelect
                    error={{
                      title: 'Failed to connect to wallet',
                      message: mapErrorMessages(
                        extensionProviderId,
                        error.message,
                        chainConfig.name,
                      ),
                    }}
                  />
                ),
                onClose: () => {
                  disconnect({ chainId: chainConfig.id })
                },
              },
            })
          }
        }
      }
      if (!isConnecting) handleConnectAsync()
    },
    [
      isConnecting,
      client,
      setIsConnecting,
      connect,
      chainConfig,
      broadcast,
      sign,
      simulate,
      disconnect,
    ],
  )

  const handleMobileConnect = useCallback(
    (mobileProviderId: string) => {
      async function handleMobileConnectAsync() {
        if (!recentWallet) {
          useStore.setState({
            client: undefined,
            address: undefined,
            userDomain: undefined,
            focusComponent: {
              component: <WalletSelect />,
              onClose: () => {
                disconnect({ chainId: chainConfig.id })
              },
            },
          })
          return
        }
        if (client || isConnecting) return
        setIsConnecting(true)
        try {
          await mobileConnect({ mobileProviderId, chainId: chainConfig.id })
          const cosmClient = await CosmWasmClient.connect(chainConfig.endpoints.rpc)
          const walletClient: WalletClient = {
            broadcast,
            cosmWasmClient: cosmClient,
            connectedWallet: recentWallet,
            sign,
            simulate,
          }
          setIsConnecting(false)
          useStore.setState({
            client: walletClient,
            address: recentWallet.account.address,
            userDomain: undefined,
            chainConfig: chainConfig,
            focusComponent: {
              component: <WalletFetchBalancesAndAccounts />,
              onClose: () => {
                useStore.setState({ focusComponent: null })
              },
            },
          })
        } catch (error) {
          setIsConnecting(false)
          if (error instanceof Error) {
            useStore.setState({
              client: undefined,
              address: undefined,
              userDomain: undefined,
              focusComponent: {
                component: (
                  <WalletSelect
                    error={{
                      title: 'Failed to connect to wallet',
                      message: mapErrorMessages(mobileProviderId, error.message, chainConfig.name),
                    }}
                  />
                ),
                onClose: () => {
                  disconnect({ chainId: chainConfig.id })
                },
              },
            })
          }
        }
      }
      if (!isConnecting) handleMobileConnectAsync()
    },
    [
      isConnecting,
      client,
      recentWallet,
      setIsConnecting,
      mobileConnect,
      chainConfig,
      broadcast,
      sign,
      simulate,
      disconnect,
    ],
  )

  useEffect(() => {
    if (!providerId) {
      useStore.setState({
        client: undefined,
        address: undefined,
        userDomain: undefined,
        focusComponent: {
          component: <WalletSelect />,
          onClose: () => {
            disconnect({ chainId: chainConfig.id })
          },
        },
      })
      return
    }
    const provider = providers.find((p) => p.id === providerId)

    if (!provider || provider.initializing || !provider.initialized || isConnecting) {
      return
    }

    const isMobileProvider = provider.id.split('-')[0] === 'mobile'
    if (isMobileProvider) {
      handleMobileConnect(provider.id)
      return
    }
    handleConnect(provider.id)
  }, [
    handleConnect,
    isConnecting,
    providerId,
    providers,
    handleMobileConnect,
    disconnect,
    chainConfig.id,
  ])

  return (
    <FullOverlayContent
      title={'Connecting...'}
      copy={'Unlock your wallet and approve the connection'}
    >
      <CircularProgress size={40} />
    </FullOverlayContent>
  )
}
