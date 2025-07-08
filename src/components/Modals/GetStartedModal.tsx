import { useCallback } from 'react'

import {
  ArrowChartLineUp,
  ChevronRight,
  CoinsSwap,
  HandCoins,
  LineChart,
  Logo,
  Luggage,
  Vault,
} from 'components/common/Icons'
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
        <ChevronRight className='w-3 h-3 opacity-0' />
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
        title='How to get started'
        description='Learn how to get started using the Mars Protocol.'
        link={DocURL.GET_STARTED_URL}
        icon={<Logo className='w-5' />}
      />
      <TutorialItem
        title='Perpetual Futures'
        description='Go long or short with margin, manage risk with stop-loss orders, and gain exposure to price movements without owning the underlying asset.'
        link={DocURL.PERPS_INTRO_URL}
        icon={<LineChart className='w-5' />}
      />
      <TutorialItem
        title='Trading'
        description='Learn how to conduct basic swapping, setting slippage percentages and more.'
        link={DocURL.TRADING_INTRO_URL}
        icon={<CoinsSwap className='w-5' />}
      />
      <TutorialItem
        title='Borrowing & Lending'
        description='Borrow and lend money against your assets on the blockchain'
        link={DocURL.BORROW_LENDING_URL}
        icon={<HandCoins className='w-5' />}
      />
      <TutorialItem
        title='Leveraged Yield Farming'
        description='Deploy capital more efficiently by using LP tokens as collateral, amplifying exposure to yield opportunities through leverage.'
        link={DocURL.FARM_INTRO_URL}
        icon={<Luggage className='w-5' />}
      />
      <TutorialItem
        title='High Leverage Strategies'
        description='Use HLS Accounts forhigher leverage ratios compared to standard Credit Accounts - while preserving overall protocol stability.'
        link={DocURL.HLS_INTRO_URL}
        icon={<ArrowChartLineUp className='w-5' />}
      />
      <TutorialItem
        title='Managed Vaults'
        description='Managed Vaults on Mars Protocol are a powerful tool enabling the decentralized deployment of trading strategies via community-managed Credit Accounts.'
        link={DocURL.MANAGE_VAULT_URL}
        icon={<Vault className='w-5' />}
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
