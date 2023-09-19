import classNames from 'classnames'

import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowRight } from 'components/Icons'

interface Props {
  leverage: number
  updatedLeverage: number | null
}

export default function AccountDetailsLeverage(props: Props) {
  const { leverage, updatedLeverage } = props

  if (!updatedLeverage) {
    return (
      <FormattedNumber
        className={'w-full text-center text-2xs'}
        amount={isNaN(leverage) ? 0 : leverage}
        options={{
          maxDecimals: 2,
          minDecimals: 2,
          suffix: 'x',
        }}
        animate
      />
    )
  }

  return (
    <div className='flex'>
      <FormattedNumber
        className={'w-full text-center text-2xs'}
        amount={isNaN(leverage) ? 1 : leverage}
        options={{
          maxDecimals: 1,
          minDecimals: 1,
          rounded: true,
        }}
        animate
      />
      <ArrowRight width={12} />
      <FormattedNumber
        className={classNames(
          'w-full text-center text-2xs',
          updatedLeverage > leverage && 'text-loss',
          updatedLeverage < leverage && 'text-profit',
        )}
        amount={isNaN(updatedLeverage) ? 0 : updatedLeverage}
        options={{ maxDecimals: 1, minDecimals: 1, rounded: true }}
        animate
      />
    </div>
  )
}
