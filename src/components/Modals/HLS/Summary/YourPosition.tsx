import React, { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { InfoCircle } from 'components/Icons'
import AprBreakdown from 'components/Modals/HLS/Summary/ApyBreakdown'
import Container from 'components/Modals/HLS/Summary/Container'
import Text from 'components/Text'
import { Tooltip } from 'components/Tooltip'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  baseApy: number
  borrowRate: number
  leverage: number
  positionValue: BNCoin
}

export default function YourPosition(props: Props) {
  const netApy = useMemo(
    () => props.baseApy * props.leverage - props.borrowRate,
    [props.baseApy, props.borrowRate, props.leverage],
  )
  const apyItems = useMemo(
    () => [
      {
        title: 'Base APY',
        amount: props.baseApy,
      },
      {
        title: 'Levered APY',
        amount: props.baseApy * props.leverage,
      },
      {
        title: 'Borrow Rate',
        amount: props.borrowRate,
      },
    ],
    [props.baseApy, props.borrowRate, props.leverage],
  )

  return (
    <Container title='Your Position'>
      <div className='flex justify-between mb-2'>
        <Text className='text-white/60 text-xs'>Total Position Value</Text>
        <DisplayCurrency
          coin={props.positionValue}
          className='text-white/60 place-self-end text-xs'
        />
      </div>
      <div className='flex justify-between'>
        <Text className='text-xs group/apytooltip' tag='span'>
          <Tooltip
            content={<AprBreakdown items={apyItems} />}
            type='info'
            className='items-center flex gap-2 group-hover/apytooltip:text-white text-white/60 cursor-pointer'
          >
            <span className='mt-0.5'>Net APY</span>{' '}
            <InfoCircle className='w-4 h-4 text-white/40  inline group-hover/apytooltip:text-white transition-all' />
          </Tooltip>
        </Text>
        <FormattedNumber
          className='text-white/60 place-self-end text-xs'
          amount={netApy}
          options={{ suffix: '%', minDecimals: 0, maxDecimals: 2 }}
        />
      </div>
    </Container>
  )
}
