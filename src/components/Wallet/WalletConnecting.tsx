import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useShuttle } from '@delphi-labs/shuttle-react'
import { useCallback, useEffect, useMemo } from 'react'

import { CircularProgress } from 'components/CircularProgress'
import FullOverlayContent from 'components/FullOverlayContent'
import WalletSelect from 'components/Wallet//WalletSelect'
import WalletFetchBalancesAndAccounts from 'components/Wallet/WalletFetchBalancesAndAccounts'
import chains from 'configs/chains'
import useCurrentChainId from 'hooks/localStorage/useCurrentChainId'
import useChainConfig from 'hooks/useChainConfig'
import useCurrentWallet from 'hooks/useCurrentWallet'
import useToggle from 'hooks/useToggle'
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
  const { connect, mobileConnect, simulate, sign, broadcast, mobileProviders, extensionProviders } =
    useShuttle()
  const providers = useMemo(
    () => [...mobileProviders, ...extensionProviders],
    [mobileProviders, extensionProviders],
  )
  const [chainId] = useCurrentChainId()
  const chainConfig = useChainConfig()
  const [isConnecting, setIsConnecting] = useToggle()
  const recentWallet = useCurrentWallet()
  const providerId = props.providerId ?? recentWallet?.providerId
  const client = useStore((s) => s.client)
  const address = useStore((s) => s.address)

  const handleConnect = useCallback(
    (extensionProviderId: string) => {
      async function handleConnectAsync() {
        if (client || isConnecting) return
        setIsConnecting(true)
        try {
          const response = await connect({ extensionProviderId, chainId: chainId })
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
            chainConfig: chains[chainId],
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
                        chains[chainId].name,
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
    [isConnecting, client, setIsConnecting, connect, chainId, broadcast, sign, simulate],
  )

  const handleMobileConnect = useCallback(
    (mobileProviderId: string) => {
      async function handleMobileConnectAsync() {
        if (client || isConnecting || !recentWallet) return
        setIsConnecting(true)
        try {
          await mobileConnect({ mobileProviderId, chainId: chainId })
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
            chainConfig: chains[chainId],
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
                        mobileProviderId,
                        error.message,
                        chains[chainId].name,
                      ),
                    }}
                  />
                ),
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
      chainId,
      chainConfig.endpoints.rpc,
      broadcast,
      sign,
      simulate,
    ],
  )

  useEffect(() => {
    if (!providerId) {
      useStore.setState({
        client: undefined,
        address: undefined,
        userDomain: undefined,
        accounts: null,
      })
      return
    }
    const provider = providers.find((p) => p.id === providerId)
    if (
      !provider ||
      provider.initializing ||
      !provider.initialized ||
      isConnecting ||
      (recentWallet && recentWallet.account.address === address)
    ) {
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
    recentWallet,
    address,
    handleMobileConnect,
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
