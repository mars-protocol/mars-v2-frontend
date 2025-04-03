import SwitchWithLabel from 'components/common/Switch/SwitchWithLabel'
import { Callout, CalloutType } from 'components/common/Callout'
import classNames from 'classnames'
import Text from 'components/common/Text'

type ReduceOnlySwitchProps = {
  isReduceOnly: boolean
  setIsReduceOnly: (value: boolean) => void
  isStopOrder: boolean
  reduceOnlyWarning: string | null
}

export const ReduceOnlySwitch = ({
  isReduceOnly,
  setIsReduceOnly,
  isStopOrder,
  reduceOnlyWarning,
}: ReduceOnlySwitchProps) => {
  return (
    <div className='flex w-full flex-col bg-white bg-opacity-5 rounded border-[1px] border-white/20'>
      <div className='flex flex-col gap-1 px-3 py-4'>
        <SwitchWithLabel
          name='reduce-only'
          label='Reduce Only'
          value={isReduceOnly}
          onChange={() => setIsReduceOnly(!isReduceOnly)}
          tooltip={
            isStopOrder
              ? 'Use "Reduce Only" for stop orders to ensure the order only reduces or closes your position.'
              : 'Use "Reduce Only" for limit orders to decrease your position. It prevents new position creation if the existing one is modified or closed.'
          }
        />
        {reduceOnlyWarning && <Callout type={CalloutType.WARNING}>{reduceOnlyWarning}</Callout>}
        <div className={'flex w-full pt-4'}>
          <div className='flex flex-1'>
            <Text className='mr-2 text-white' size='sm'>
              Conditional Triggers
            </Text>
          </div>
          <div className='flex gap-4'>
            <button className='text-[#ff5e57] hover:text-[#ff5e57]/80'>Add</button>
            <div className='text-white/10'>|</div>
            <button className='text-white/50 hover:text-white/70'>Clear</button>
          </div>
        </div>
      </div>
    </div>
  )
}
