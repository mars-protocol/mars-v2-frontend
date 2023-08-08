import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useShuttle } from '@delphi-labs/shuttle-react'
import { useCallback, useEffect } from 'react'

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
  const { extensionProviders, recentWallet, connect, simulate, sign, broadcast } = useShuttle()
  const [isConnecting, setIsConnecting] = useToggle()
  const providerId = props.providerId ?? recentWallet?.providerId
  const isAutoConnect = props.autoConnect

  const handleConnect = useCallback(
    (extensionProviderId: string) => {
      async function handleConnectAsync() {
        setIsConnecting(true)

        try {
          const provider = extensionProviders.find((p) => p.id === providerId)
          const response =
            isAutoConnect && provider
              ? await provider.connect({ chainId: currentChainId })
              : await connect({ extensionProviderId, chainId: currentChainId })
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
            focusComponent: { component: <WalletFetchBalancesAndAccounts /> },
          })
        } catch (error) {
          if (error instanceof Error) {
            setIsConnecting(false)
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

      handleConnectAsync()
    },
    [
      broadcast,
      connect,
      extensionProviders,
      isAutoConnect,
      providerId,
      setIsConnecting,
      sign,
      simulate,
    ],
  )

  useEffect(() => {
    if (isConnecting || !providerId) return
    handleConnect(providerId)
  }, [isConnecting, providerId, handleConnect])

  return (
    <FullOverlayContent
      title={'Connecting...'}
      copy={'Unlock your wallet and approve the connection'}
    >
      <CircularProgress size={40} />
    </FullOverlayContent>
  )
}
