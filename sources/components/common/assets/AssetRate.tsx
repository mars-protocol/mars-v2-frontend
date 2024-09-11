import classNames from 'classnames'

import { FormattedNumber } from '../FormattedNumber'
import { InfoCircle } from '../Icons'
import Text from '../Text'
import { Tooltip } from '../Tooltip'

interface Props {
  rate: number
  isEnabled: boolean
  type: 'apy' | 'apr'
  orientation: 'ltr' | 'rtl'
  className?: string
  suffix?: boolean
}

interface TooltipProps {
  orientation: Props['orientation']
}

function RateTooltip(props: TooltipProps) {
  return (
    <Tooltip
      content='This asset cannot be borrowed, and thus does not currently generate yield when lending.'
      type='info'
      className={props.orientation === 'ltr' ? 'mr-1' : 'ml-1'}
    >
      <InfoCircle className='w-4 h-4 text-white/40 hover:text-inherit' />
    </Tooltip>
  )
}

export default function AssetRate(props: Props) {
  const { rate, isEnabled, type, orientation, className } = props
  const suffix = type === 'apy' ? 'APY' : 'APR'

  if (!isEnabled)
    return (
      <Text tag='div' className={classNames('flex items-center', className)}>
        {orientation === 'ltr' && <RateTooltip orientation='ltr' />}N/A
        {orientation === 'rtl' && <RateTooltip orientation='rtl' />}
      </Text>
    )

  return (
    <FormattedNumber
      amount={rate}
      className={className}
      options={{ suffix: props.suffix ? `% ${suffix}` : '%', maxDecimals: 2 }}
      animate
    />
  )
}
