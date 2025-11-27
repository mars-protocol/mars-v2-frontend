import { useMemo } from 'react'

import Loading from 'components/common/Loading'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import { CampaignLogo } from 'constants/campaigns'

export const APY_META = {
  id: 'apy',
  accessorKey: 'apy.deposit',
  header: 'APY',
  meta: { className: 'w-24' },
}

interface Props {
  apy: number
  borrowEnabled: boolean
  isLoading: boolean
  campaigns?: AssetCampaign[]
}

function ApyTooltipContent({
  marketApy,
  campaignApys,
}: {
  marketApy: number
  campaignApys: Array<{ campaign: AssetCampaign; apy: number }>
}) {
  const formatApy = (apy: number) => {
    if (apy > 0 && apy < 0.01) {
      return '< 0.01%'
    }
    return null // Let FormattedNumber handle it
  }

  const totalApy = marketApy + campaignApys.reduce((sum, { apy }) => sum + apy, 0)

  return (
    <div className='flex flex-col gap-3 max-w-xs'>
      {/* Campaign Information */}
      {campaignApys.map(({ campaign }) => (
        <div key={campaign.id} className='text-xs text-white/80 whitespace-normal break-words'>
          {campaign.tooltip}
        </div>
      ))}

      {/* APY Breakdown Section */}
      <div className='flex flex-col gap-1'>
        <div className='text-xs font-semibold text-white mb-1'>APY Breakdown</div>
        <div className='flex justify-between gap-4'>
          <span className='whitespace-nowrap'>Lending APY:</span>
          {formatApy(marketApy) ? (
            <span className='text-white'>{formatApy(marketApy)}</span>
          ) : (
            <FormattedNumber
              amount={marketApy}
              options={{ suffix: '%', maxDecimals: 2 }}
              className='text-white'
            />
          )}
        </div>
        {campaignApys.map(({ campaign, apy }) => (
          <div key={campaign.id} className='flex justify-between gap-4'>
            <span className='whitespace-nowrap'>{campaign.name}:</span>
            {formatApy(apy) ? (
              <span className='text-white'>{formatApy(apy)}</span>
            ) : (
              <FormattedNumber
                amount={apy}
                options={{ suffix: '%', maxDecimals: 2 }}
                className='text-white'
              />
            )}
          </div>
        ))}
        <div className='flex justify-between gap-4 pt-1 mt-1 border-t border-white/20'>
          <span className='text-white font-semibold whitespace-nowrap'>Total APY:</span>
          {formatApy(totalApy) ? (
            <span className='text-white font-semibold'>{formatApy(totalApy)}</span>
          ) : (
            <FormattedNumber
              amount={totalApy}
              options={{ suffix: '%', maxDecimals: 2 }}
              className='text-white font-semibold'
            />
          )}
        </div>
      </div>
    </div>
  )
}

const CAMPAIGN_GRADIENTS: Record<string, string> = {
  stride: 'linear-gradient(90deg, #e50571, #fb5da9)',
  droplets: 'linear-gradient(90deg, #6039ff, #e8b8ff)',
  lido: 'linear-gradient(rgb(101, 98, 255) 11.28%, rgb(0, 163, 255) 61.02%, rgb(99, 214, 210) 100%)',
  milkyway: 'linear-gradient(90deg, #fef7f1 0%, #fde2fb 50%, #fde4fc 100%)',
  'ntrn-rewards': 'linear-gradient(90deg, #ff4b2f, #ff9382)',
  fragments: 'linear-gradient(90deg, #FB4A2C, #E12F72)',
}

export default function Apr(props: Props) {
  const campaignApys = useMemo(() => {
    return (props.campaigns || [])
      .filter((campaign) => campaign.type === 'apy' && campaign.apy)
      .map((campaign) => ({ campaign, apy: campaign.apy! }))
  }, [props.campaigns])

  const totalApy = useMemo(() => {
    const campaignApySum = campaignApys.reduce((sum, { apy }) => sum + apy, 0)
    return props.apy + campaignApySum
  }, [props.apy, campaignApys])

  const hasCampaignApy = campaignApys.length > 0

  // Get gradient from the first campaign
  const campaignClassName = hasCampaignApy ? campaignApys[0].campaign.classNames : ''
  const gradient = hasCampaignApy ? CAMPAIGN_GRADIENTS[campaignClassName] : ''

  if (props.isLoading) return <Loading />

  if (!props.borrowEnabled && !hasCampaignApy) {
    return (
      <Text tag='div' className='flex items-center justify-end text-xs'>
        <Tooltip
          content='This asset cannot be borrowed, and thus does not currently generate yield when lending.'
          type='info'
          className='mr-1'
        >
          <InfoCircle className='w-4 h-4 text-white/40 hover:text-inherit' />
        </Tooltip>
        N/A
      </Text>
    )
  }

  // If not borrowEnabled but has campaign APY, show it with tooltip explaining it's staking APY
  if (!props.borrowEnabled && hasCampaignApy) {
    return (
      <Tooltip
        content={
          <div className='flex flex-col gap-3 max-w-xs'>
            {/* Campaign Information */}
            {campaignApys.map(({ campaign }) => (
              <div
                key={`${campaign.id}-info`}
                className='text-xs text-white/80 whitespace-normal break-words'
              >
                {campaign.tooltip}
              </div>
            ))}
          </div>
        }
        type='info'
      >
        <div className='flex items-center justify-end gap-1 cursor-pointer'>
          <span
            className='whitespace-nowrap text-xs font-medium'
            style={{
              background: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            <FormattedNumber
              amount={totalApy}
              options={{ suffix: '%', maxDecimals: 2, abbreviated: true }}
            />
          </span>
          {hasCampaignApy && (
            <span
              className='w-3.5 h-3.5 flex items-center justify-center flex-shrink-0'
              style={{
                color: 'transparent',
                background: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              <CampaignLogo campaignId={campaignApys[0].campaign.id} />
            </span>
          )}
        </div>
      </Tooltip>
    )
  }

  if (!hasCampaignApy) {
    return (
      <FormattedNumber
        amount={totalApy}
        className='whitespace-nowrap justify-end text-xs'
        options={{ suffix: '%', maxDecimals: 2, abbreviated: true }}
      />
    )
  }

  return (
    <Tooltip
      content={<ApyTooltipContent marketApy={props.apy} campaignApys={campaignApys} />}
      type='info'
    >
      <div className='flex items-center justify-end gap-1 cursor-pointer'>
        <span
          className='whitespace-nowrap text-xs font-medium'
          style={{
            background: gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          <FormattedNumber
            amount={totalApy}
            options={{ suffix: '%', maxDecimals: 2, abbreviated: true }}
          />
        </span>
        {hasCampaignApy && (
          <span
            className='w-3.5 h-3.5 flex items-center justify-center flex-shrink-0'
            style={{
              color: 'transparent',
              background: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            <CampaignLogo campaignId={campaignApys[0].campaign.id} />
          </span>
        )}
      </div>
    </Tooltip>
  )
}
