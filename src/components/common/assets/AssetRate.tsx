import classNames from 'classnames'

import { FormattedNumber } from 'components/common/FormattedNumber'
import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'

interface Props {
  rate: number
  isEnabled: boolean
  type: 'apy' | 'apr'
  orientation: 'ltr' | 'rtl'
  className?: string
  suffix?: boolean
  hasCampaignApy?: boolean
}

interface TooltipProps {
  orientation: Props['orientation']
  hasCampaignApy?: boolean
}

function RateTooltip(props: TooltipProps) {
  return (
    <Tooltip
      content={
        props.hasCampaignApy
          ? 'This asset cannot be borrowed, but generates its underlying staking APY.'
          : 'This asset cannot be borrowed, and thus does not currently generate yield when lending.'
      }
      type='info'
      className={props.orientation === 'ltr' ? 'mr-1' : 'ml-1'}
    >
      <InfoCircle className='w-4 h-4 text-white/40 hover:text-inherit' />
    </Tooltip>
  )
}

export default function AssetRate(props: Props) {
  const { rate, isEnabled, type, orientation, className, hasCampaignApy } = props
  const suffix = type === 'apy' ? 'APY' : 'APR'

  if (!isEnabled)
    return (
      <Text tag='div' className={classNames('flex items-center', className)}>
        {orientation === 'ltr' && <RateTooltip orientation='ltr' hasCampaignApy={hasCampaignApy} />}
        N/A
        {orientation === 'rtl' && <RateTooltip orientation='rtl' hasCampaignApy={hasCampaignApy} />}
      </Text>
    )

  return (
    <FormattedNumber
      amount={rate}
      className={className}
      options={{ suffix: props.suffix ? `% ${suffix}` : '%', maxDecimals: 2, abbreviated: true }}
      animate
    />
  )
}
