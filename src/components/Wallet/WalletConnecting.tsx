import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useShuttle } from '@delphi-labs/shuttle-react'
import { useCallback, useEffect, useMemo } from 'react'

import { CircularProgress } from 'components/CircularProgress'
import FullOverlayContent from 'components/FullOverlayContent'
import WalletSelect from 'components/Wallet//WalletSelect'
import WalletFetchBalancesAndAccounts from 'components/Wallet/WalletFetchBalancesAndAccounts'
import { CHAINS } from 'constants/chains'
import { ENV } from 'constants/env'
import useToggle from 'hooks/useToggle'
import useStore from 'store'

interface Props {
  autoConnect?: boolean
  providerId?: string
}

const currentChainId = ENV.CHAIN_ID
const currentChain = CHAINS[currentChainId]

const mapErrorMessages = (providerId: string, errorMessage: string) => {
  if (providerId === 'station') {
    if (errorMessage.match('Wallet not connected to the network with chainId')) {
      return `Your wallet is not connected to the correct network. Please switch your wallet to the ${currentChain.name} network`
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
  const [isConnecting, setIsConnecting] = useToggle()
  const providerId = props.providerId ?? recentWallet?.providerId
  const isAutoConnect = props.autoConnect
  const client = useStore((s) => s.client)
  const address = useStore((s) => s.address)

  const handleConnect = useCallback(
    (extensionProviderId: string) => {
      async function handleConnectAsync() {
        if (client || isConnecting) return
        setIsConnecting(true)
        try {
          const response = await connect({ extensionProviderId, chainId: currentChainId })
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
          if (isAutoConnect) return
          if (error instanceof Error) {
            useStore.setState({
              client: undefined,
              address: undefined,
              accounts: null,
              focusComponent: {
                component: (
                  <WalletSelect
                    error={{
                      title: 'Failed to connect to wallet',
                      message: mapErrorMessages(extensionProviderId, error.message),
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
    [broadcast, connect, client, isAutoConnect, isConnecting, setIsConnecting, sign, simulate],
  )

  useEffect(() => {
    const provider = providers.find((p) => p.id === providerId)
    if (
      !provider ||
      !provider.initialized ||
      isConnecting ||
      (recentWallet && recentWallet.account.address === address)
    )
      return
    handleConnect(provider.id)
  }, [handleConnect, isConnecting, providerId, providers, recentWallet, address])

  return (
    <FullOverlayContent
      title={'Connecting...'}
      copy={'Unlock your wallet and approve the connection'}
    >
      <CircularProgress size={40} />
    </FullOverlayContent>
  )
}
