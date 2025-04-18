import { Callout, CalloutType } from 'components/common/Callout'
import SwitchWithLabel from 'components/common/Switch/SwitchWithLabel'
import Text from 'components/common/Text'
import USD from 'constants/USDollar'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { useCallback, useEffect, useMemo } from 'react'
import useStore from 'store'
import { formatValue } from 'utils/formatters'

type PerpsOrderOptionsProps = {
  isReduceOnly: boolean
  setIsReduceOnly: (value: boolean) => void
  isStopOrder: boolean
  reduceOnlyWarning: string | null
  conditionalTriggers: { sl: string | null; tp: string | null }
}

export const PerpsOrderOptions = ({
  isReduceOnly,
  setIsReduceOnly,
  isStopOrder,
  reduceOnlyWarning,
  conditionalTriggers,
}: PerpsOrderOptionsProps) => {
  const perpsAsset = usePerpsAsset()
  const handleOpenConditionalTriggers = useCallback(() => {
    useStore.setState({ conditionalTriggersModal: true })
  }, [])

  const handleClearTriggers = useCallback(async () => {
    useStore.setState({ conditionalTriggerOrders: { sl: null, tp: null } })
  }, [])

  const hasConditionalTriggers = useMemo(() => {
    return conditionalTriggers.tp !== null || conditionalTriggers.sl !== null
  }, [conditionalTriggers.tp, conditionalTriggers.sl])

  useEffect(() => {
    handleClearTriggers()
  }, [handleClearTriggers, perpsAsset.perpsAsset.denom])

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
            <div onClick={handleOpenConditionalTriggers}>
              <Text
                size='sm'
                className='text-[#ff5e57] hover:text-[#ff5e57]/80 hover:cursor-pointer'
              >
                {hasConditionalTriggers ? 'Edit' : 'Add'}
              </Text>
            </div>
            {hasConditionalTriggers && (
              <>
                <div className='text-white/10'>|</div>
                <div onClick={handleClearTriggers}>
                  <Text size='sm' className='text-white/50 hover:text-white hover:cursor-pointer'>
                    Clear
                  </Text>
                </div>
              </>
            )}
          </div>
        </div>
        {conditionalTriggers.sl && (
          <div className={'flex w-full pt-4'}>
            <div className='flex flex-1'>
              <Text className='mr-2 text-white/50' size='sm'>
                Stop Loss
              </Text>
            </div>

            <Text size='sm' className='text-white'>
              {formatValue(Number(conditionalTriggers.sl), {
                maxDecimals: USD.decimals,
                minDecimals: USD.decimals,
                prefix: USD.symbol,
              })}
            </Text>
          </div>
        )}
        {conditionalTriggers.tp && (
          <div className={'flex w-full '}>
            <div className='flex flex-1'>
              <Text className='mr-2 text-white/50' size='sm'>
                Take Profit
              </Text>
            </div>
            {conditionalTriggers.tp && (
              <Text size='sm' className='text-white'>
                ${conditionalTriggers.tp}
              </Text>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
