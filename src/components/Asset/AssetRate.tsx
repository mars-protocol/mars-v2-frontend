import classNames from 'classnames'

import { FormattedNumber } from 'components/FormattedNumber'
import Text from 'components/Text'
import { Tooltip } from 'components/Tooltip'
import { convertAprToApy } from 'utils/parsers'

interface Props {
  apr: number
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
    />
  )
}

export default function AssetRate(props: Props) {
  const { apr, isEnabled, type, orientation, className } = props

  const rate = type === 'apy' ? convertAprToApy(apr, 365) : apr
  const suffix = type === 'apy' ? 'APY' : 'APR'

  if (!isEnabled)
    return (
      <Text className={classNames('flex items-center', className)}>
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
