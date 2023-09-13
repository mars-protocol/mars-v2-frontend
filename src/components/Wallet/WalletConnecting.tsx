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
  const { recentWallet, connect, simulate, sign, broadcast } = useShuttle()
  const [isConnecting, setIsConnecting] = useToggle()
  const providerId = props.providerId ?? recentWallet?.providerId
  const isAutoConnect = props.autoConnect
  const client = useStore((s) => s.client)

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
      setTimeout(
        () => {
          if (isConnecting) return
          handleConnectAsync()
        },
        isAutoConnect ? 1000 : 0,
      )
    },
    [broadcast, connect, client, isAutoConnect, isConnecting, setIsConnecting, sign, simulate],
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
