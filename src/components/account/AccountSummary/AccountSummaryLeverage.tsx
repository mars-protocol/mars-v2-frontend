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

export default function AccountSummaryLeverage(props: Props) {
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
        props.containerClassName
          ? props.containerClassName
          : 'flex items-center justify-center w-full',
      )}
    >
      <FormattedNumber
        className={classNames(props.className ? props.className : 'w-4 text-center text-2xs pr-1')}
        amount={isNaN(leverage) ? 1 : leverage}
        options={{
          maxDecimals: props.enforceSuffix ? 2 : 1,
          minDecimals: props.enforceSuffix ? 2 : 1,
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
          props.className ? props.className : 'w-4 text-center text-2xs pl-1',
          updatedLeverage > leverage && 'text-loss',
          updatedLeverage < leverage && 'text-profit',
        )}
        amount={isNaN(updatedLeverage) ? 0 : updatedLeverage}
        options={{
          maxDecimals: props.enforceSuffix ? 2 : 1,
          minDecimals: props.enforceSuffix ? 2 : 1,
          rounded: true,
          suffix: props.enforceSuffix ? 'x' : '',
        }}
        animate
      />
    </div>
  )
}
