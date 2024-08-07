import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount } from 'wagmi'
import { useCallback } from 'react'

import Button from 'components/common/Button'
import FullOverlayContent from 'components/common/FullOverlayContent'
import { useShuttle } from '@delphi-labs/shuttle-react'
import WalletSelect from 'components/Wallet/WalletSelect'
import useCurrentWallet from 'hooks/wallet/useCurrentWallet'
import useStore from 'store'

export default function EvmSupportedBridges() {
  const { open } = useWeb3Modal()
  const { isConnected } = useAccount()

  const currentWallet = useCurrentWallet()
  const { disconnectWallet } = useShuttle()

  const handleClick = useCallback(() => {
    if (!currentWallet) return
    disconnectWallet(currentWallet)
    useStore.setState({ focusComponent: { component: <WalletSelect /> } })
  }, [currentWallet, disconnectWallet])

  const handleOpenWeb3Modal = useCallback(() => {
    open()
  }, [open])

  return (
    <FullOverlayContent
      title={isConnected ? 'Bridge EVM tokens' : 'Connect your wallet'}
      copy={
        isConnected
          ? 'Bridge your EVM tokens to Mars. To start, select the tokens you want to bridge.'
          : 'Connect your wallet to interact with the application.'
      }
      button={
        !isConnected
          ? {
              className: 'w-full mt-4',
              text: 'Connect different Cosmos wallet',
              color: 'tertiary',
              onClick: handleClick,
              size: 'lg',
            }
          : undefined
      }
      docs='wallet'
    >
      {isConnected ? (
        <Button className='w-full mt-4' onClick={handleOpenWeb3Modal} color='tertiary' size='lg'>
          View your EVM assets
        </Button>
      ) : (
        <Button className='w-full mt-4' onClick={handleOpenWeb3Modal} color='tertiary' size='lg'>
          Connect an EVM Wallet
        </Button>
      )}
    </FullOverlayContent>
  )
}
