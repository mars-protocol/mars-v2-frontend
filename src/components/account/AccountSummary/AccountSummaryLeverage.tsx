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
      />
    )
  }

  return (
    <div
      className={classNames(
        props.containerClassName
          ? props.containerClassName
          : 'flex items-center w-full justify-between',
      )}
    >
      <FormattedNumber
        className={classNames(props.className ? props.className : 'w-6 text-left text-2xs pl-2')}
        amount={isNaN(leverage) ? 1 : leverage}
        options={{
          maxDecimals: props.enforceSuffix ? 2 : 1,
          minDecimals: props.enforceSuffix ? 2 : 1,
          rounded: true,
          suffix: props.enforceSuffix ? 'x' : '',
        }}
      />
      <div
        className={classNames(
          'w-3',
          updatedLeverage > leverage && 'text-loss',
          updatedLeverage < leverage && 'text-profit',
        )}
      >
        <ArrowRight />
      </div>
      <FormattedNumber
        className={classNames(
          props.className ? props.className : 'w-6 text-right text-2xs pr-2',
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
      />
    </div>
  )
}
