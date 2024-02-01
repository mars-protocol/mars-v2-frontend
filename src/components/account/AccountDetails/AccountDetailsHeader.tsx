import { useCallback } from 'react'

import useStore from 'store'
import EscButton from 'components/common/Button/EscButton'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { ArrowRightLine } from 'components/common/Icons'
import Text from 'components/common/Text'

import AccountDetailsLeverage from './AccountDetailsLeverage'

import HealthBar from '../Health/HealthBar'

interface Props {
  id: string
  netWorth: BNCoin
  leverage: number
  updatedLeverage: number | null
  apr: number
  health: number
  updatedHealth: number
  healthFactor: number
  updatedHealthFactor: number
}

export default function AccountDetailsHeader(props: Props) {
  const { id, netWorth, leverage, updatedLeverage, health, healthFactor } = props
  const onClose = useCallback(() => useStore.setState({ accountDetailsExpanded: false }), [])

  return (
    <div className='relative flex flex-wrap w-full p-4 bg-white/10'>
      <EscButton
        icon={<ArrowRightLine />}
        onClick={onClose}
        hideText
        className='!absolute top-4 right-4 w-8 h-6 px-2 z-4'
      />
      <Text size='sm' className='w-full pb-1 text-white/50'>{`Credit Account ${id}`}</Text>
      <div className='flex items-end w-full gap-1 pb-2 border-b border-white/5'>
        <DisplayCurrency
          options={{ abbreviated: false }}
          coin={netWorth}
          className='text-lg -mb-[1px]'
        />
        <Text className='text-white/50' size='xs'>
          Networth
        </Text>
      </div>
      <div className='flex items-center w-full pt-2'>
        <div className='flex flex-wrap pr-4 border-r w-25 border-white/5'>
          <Text size='xs' className='mb-0.5 w-full text-white/50'>
            Leverage
          </Text>
          <AccountDetailsLeverage
            leverage={leverage}
            updatedLeverage={updatedLeverage}
            className='text-sm'
            containerClassName='flex items-center gap-1'
            enforceSuffix
          />
        </div>
        <div className='flex flex-wrap content-start flex-grow h-full pl-2'>
          <Text size='xs' className='w-full h-4 mb-2 text-white/50'>
            Health
          </Text>
          <HealthBar health={health} healthFactor={healthFactor} />
        </div>
      </div>
    </div>
  )
}
