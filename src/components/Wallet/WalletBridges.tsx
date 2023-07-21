import { useShuttle } from '@delphi-labs/shuttle-react'
import Image from 'next/image'
import { useCallback } from 'react'

import Button from 'components/Button'
import { ChevronRight } from 'components/Icons'
import Text from 'components/Text'
import WalletSelect from 'components/Wallet/WalletSelect'
import WalletTutorial from 'components/Wallet/WalletTutorial'
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
    <div className='min-h-[600px] w-100'>
      <Text size='4xl' className='w-full pb-2 text-center'>
        No supported assets
      </Text>
      <Text size='sm' className='h-14 w-full text-center text-white/60'>
        {`Your connected wallet has no (supported) assets. To create your account, please connect a
        different ${currentChain.name} address or bridge assets.`}
      </Text>
      <div className='flex w-full flex-wrap items-start gap-3 pb-6 pt-4'>
        {BRIDGES.map((bridge) => (
          <Bridge key={bridge.name} {...bridge} />
        ))}
      </div>
      <Button
        className='w-full'
        text='Connect different wallet'
        color='tertiary'
        onClick={handleClick}
        size='lg'
      />
      <WalletTutorial type='wallet' />
    </div>
  )
}
