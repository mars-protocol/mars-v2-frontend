import { useShuttle } from '@delphi-labs/shuttle-react'
import Image from 'next/image'
import { useCallback } from 'react'

import Button from 'components/Button'
import FocusComponent from 'components/FocusedComponent'
import { ChevronRight } from 'components/Icons'
import Text from 'components/Text'
import WalletSelect from 'components/Wallet/WalletSelect'
import { BRIDGES } from 'constants/bridges'
import { CHAINS } from 'constants/chains'
import { ENV } from 'constants/env'
import useCurrentWallet from 'hooks/useCurrentWallet'
import useStore from 'store'

const currentChainId = ENV.CHAIN_ID
const currentChain = CHAINS[currentChainId]

function Bridge({ name, url, image }: Bridge) {
  return (
    <Button
      color='tertiary'
      className='flex w-full px-4 py-3'
      onClick={() => {
        window.open(url, '_blank')
      }}
    >
      <Image className='rounded-full' width={20} height={20} src={image} alt={name} />
      <Text className='ml-2 flex-1 text-left'>{name}</Text>
      <ChevronRight className='h-4 w-4' />
    </Button>
  )
}

export default function WalletBridges() {
  const currentWallet = useCurrentWallet()
  const { disconnectWallet } = useShuttle()

  const handleClick = useCallback(() => {
    if (!currentWallet) return
    disconnectWallet(currentWallet)
    useStore.setState({ focusComponent: <WalletSelect /> })
  }, [currentWallet, disconnectWallet])

  return (
    <FocusComponent
      title='No supported assets'
      copy={`Your connected wallet has no (supported) assets. To create your account, please connect a
    different ${currentChain.name} address or bridge assets.`}
      button={{
        className: 'w-full mt-4',
        text: 'Connect different wallet',
        color: 'tertiary',
        onClick: handleClick,
        size: 'lg',
      }}
      docs='wallet'
    >
      <div className='flex w-full flex-wrap gap-3'>
        {BRIDGES.map((bridge) => (
          <Bridge key={bridge.name} {...bridge} />
        ))}
      </div>
    </FocusComponent>
  )
}
