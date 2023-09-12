import classNames from 'classnames'

import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowRight } from 'components/Icons'

interface Props {
  leverage: BigNumber
  updatedLeverage: BigNumber | null
}

export default function AccountDetailsLeverage(props: Props) {
  const { leverage, updatedLeverage } = props

  if (!updatedLeverage) {
    return (
      <FormattedNumber
        className={'w-full text-center text-2xs'}
        amount={isNaN(leverage.toNumber()) ? 0 : leverage.toNumber()}
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
        amount={isNaN(leverage.toNumber()) ? 0 : leverage.toNumber()}
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
          updatedLeverage.gt(leverage) && 'text-loss',
          updatedLeverage.lt(leverage) && 'text-profit',
        )}
        amount={isNaN(updatedLeverage.toNumber()) ? 0 : updatedLeverage.toNumber()}
        options={{ maxDecimals: 1, minDecimals: 1, rounded: true }}
        animate
      />
    </div>
  )
}
