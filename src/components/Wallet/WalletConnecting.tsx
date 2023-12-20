import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import {
  useShuttle,
  WalletExtensionProvider,
  WalletMobileProvider,
} from '@delphi-labs/shuttle-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { CircularProgress } from 'components/CircularProgress'
import FullOverlayContent from 'components/FullOverlayContent'
import WalletSelect from 'components/Wallet//WalletSelect'
import WalletFetchBalancesAndAccounts from 'components/Wallet/WalletFetchBalancesAndAccounts'
import useToggle from 'hooks/useToggle'
import useStore from 'store'

interface Props {
  autoConnect?: boolean
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
  const { recentWallet, connect, simulate, sign, broadcast, mobileProviders, extensionProviders } =
    useShuttle()
  const providers = useMemo(
    () => [...mobileProviders, ...extensionProviders],
    [mobileProviders, extensionProviders],
  )
  const chainConfig = useStore((s) => s.chainConfig)

  const [isConnecting, setIsConnecting] = useToggle()
  const providerId = props.providerId ?? recentWallet?.providerId
  const refTimer = useRef<number | null>(null)
  const isAutoConnect = props.autoConnect
  const client = useStore((s) => s.client)
  const address = useStore((s) => s.address)

  const clearTimer = useCallback(() => {
    if (refTimer.current !== null) window.clearTimeout(refTimer.current)
  }, [refTimer])

  const handleConnect = useCallback(
    (extensionProviderId: string) => {
      async function handleConnectAsync() {
        if (client || isConnecting) return
        setIsConnecting(true)
        clearTimer()
        try {
          const response = await connect({ extensionProviderId, chainId: chainConfig.id })
          const cosmClient = await CosmWasmClient.connect(response.network.rpc)
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
              accounts: null,
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
      clearTimer,
      connect,
      chainConfig.id,
      chainConfig.name,
      broadcast,
      sign,
      simulate,
    ],
  )

  const startTimer = useCallback(
    (provider?: WalletMobileProvider | WalletExtensionProvider) => {
      if (refTimer.current !== null || !window) return
      refTimer.current = window.setTimeout(() => handleConnect(provider?.id ?? ''), 5000)
    },
    [refTimer, handleConnect],
  )

  useEffect(() => {
    const provider = providers.find((p) => p.id === providerId)
    if (
      !provider ||
      !provider.initialized ||
      isConnecting ||
      (recentWallet && recentWallet.account.address === address)
    ) {
      if (isAutoConnect) startTimer(provider)
      return
    }

    handleConnect(provider.id)

    return () => clearTimer()
  }, [
    handleConnect,
    isConnecting,
    providerId,
    providers,
    recentWallet,
    address,
    isAutoConnect,
    startTimer,
    clearTimer,
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
