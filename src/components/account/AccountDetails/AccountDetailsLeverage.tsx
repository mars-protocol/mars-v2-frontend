import classNames from 'classnames'

import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowRight } from 'components/common/Icons'

interface Props {
  leverage: number
  updatedLeverage: number | null
  className?: string
  containerClassName?: string
  enforceSuffix?: boolean
}

export default function AccountDetailsLeverage(props: Props) {
  const { leverage, updatedLeverage } = props

  if (!updatedLeverage) {
    return (
      <FormattedNumber
        className={classNames(props.className ? props.className : 'w-full text-center text-2xs')}
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
    <div
      className={classNames(
        props.containerClassName ? props.containerClassName : 'flex items-center',
      )}
    >
      <FormattedNumber
        className={classNames(props.className ? props.className : 'w-full text-center text-2xs')}
        amount={isNaN(leverage) ? 1 : leverage}
        options={{
          maxDecimals: 1,
          minDecimals: 1,
          rounded: true,
          suffix: props.enforceSuffix ? 'x' : '',
        }}
        animate
      />
      <div className='w-3.5'>
        <ArrowRight />
      </div>
      <FormattedNumber
        className={classNames(
          props.className ? props.className : 'w-full text-center text-2xs',
          updatedLeverage > leverage && 'text-loss',
          updatedLeverage < leverage && 'text-profit',
        )}
        amount={isNaN(updatedLeverage) ? 0 : updatedLeverage}
        options={{
          maxDecimals: 1,
          minDecimals: 1,
          rounded: true,
          suffix: props.enforceSuffix ? 'x' : '',
        }}
        animate
      />
    </div>
  )
}
