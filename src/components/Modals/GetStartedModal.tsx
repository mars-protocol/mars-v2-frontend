import { useCallback } from 'react'

import { ChevronRight, Compass, HandCoins, Luggage } from 'components/common/Icons'
import Text from 'components/common/Text'
import Modal from 'components/Modals/Modal'
import useStore from 'store'
import { DocURL } from 'types/enums'

interface TutorialItemProps {
  title: string
  description: string
  link: string
  icon: React.ReactNode
}

function TutorialItem(props: TutorialItemProps) {
  return (
    <a
      href={props.link}
      title={props.title}
      target='_blank'
      className='flex items-center px-2 py-3 rounded-base hover:bg-white/5 group/item'
    >
      <div className='flex items-center justify-center w-8 h-8 rounded-base bg-white/5'>
        {props.icon}
      </div>
      <div className='flex flex-col ml-3'>
        <Text size='sm' className='pb-1'>
          {props.title}
        </Text>
        <Text size='sm' className='text-white/50'>
          {props.description}
        </Text>
      </div>
      <div className='flex items-center justify-end flex-grow h-full pr-4'>
        <ChevronRight className='w-3 h-3 opacity-0 group-hover/item:opacity-100' />
      </div>
    </a>
  )
}

export default function GetStartedModal() {
  const modal = useStore((s) => s.getStartedModal)
  const onClose = useCallback(() => {
    useStore.setState({ getStartedModal: false })
  }, [])

  if (!modal) return null

  return (
    <Modal
      onClose={onClose}
      header={<Text>Get Started</Text>}
      className='relative'
      headerClassName='gradient-header p-4 border-b-white/5 border-b'
      contentClassName='flex flex-col p-3 pb-8'
    >
      <Text size='sm' className='p-2 pt-0 text-white/50'>
        Tutorials
      </Text>
      <TutorialItem
        title='Beginner Trading'
        description='Learn how to conduct basic swapping, setting slippage percentages and more.'
        link={DocURL.TRADING_INTRO_URL}
        icon={<Compass className='w-5 opacity-50 group-hover/item:opacity-100' />}
      />
      <TutorialItem
        title='Advanced Trading'
        description='Learn how to margin trade, stop-loss trade and operate our advanced trading module.'
        link={DocURL.ADVANCED_TRADING_URL}
        icon={<Luggage className='w-5 opacity-50 group-hover/item:opacity-100' />}
      />
      <TutorialItem
        title='Borrowing & Lending'
        description='Borrow and lend money against your assets on the blockchain'
        link={DocURL.BORROW_LENDING_URL}
        icon={<HandCoins className='w-5 opacity-50 group-hover/item:opacity-100' />}
      />
      <Text
        size='sm'
        className='absolute bottom-0 left-0 w-full px-4 py-1 rounded-b-base bg-black/80 text-white/30'
      >
        You can access this modal via the settings if you decide to close it.
      </Text>
    </Modal>
  )
}
