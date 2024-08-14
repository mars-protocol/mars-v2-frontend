import classNames from 'classnames'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import { CampaignLogo } from 'constants/campaigns'
import useAssets from 'hooks/assets/useAssets'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { formatValue, getCoinValue } from 'utils/formatters'

interface Props {
  asset: Asset
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  className?: string
  textClassName?: string
  withLogo?: boolean
  amount?: BigNumber
}

export default function AssetCampaignCopyControler(props: Props) {
  const { asset } = props
  if (!asset.campaign) return null

  return <AssetCampaignCopy {...props} />
}

function AssetCampaignCopy(props: Props) {
  const { asset, className, amount, withLogo, size, textClassName } = props
  const { data: assets } = useAssets()

  const incentiveCopy = useMemo(() => {
    if (!asset.campaign) return ''
    if (!amount || amount.isZero() || asset.campaign.type === 'apy')
      return asset.campaign.incentiveCopy

    const tokenValue = getCoinValue(BNCoin.fromDenomAndBigNumber(asset.denom, amount), assets)
    const detailedCopy = asset.campaign.detailedIncentiveCopy
    const campaignPoints = tokenValue
      .times(asset.campaign?.multiplier ?? 0)
      .integerValue()
      .toString()

    return detailedCopy.replace(
      '##POINTS##',
      formatValue(campaignPoints, { maxDecimals: 0, minDecimals: 0, abbreviated: false }),
    )
  }, [amount, asset.campaign, asset.denom, assets])

  const iconClasses = useMemo(() => {
    if (size === 'xs') return 'w-4 h-4'
    if (size === 'sm') return 'w-5 h-5'
    return 'w-6 h-6'
  }, [size])

  if (!asset.campaign) return null

  return (
    <div className='inline-block'>
      <Tooltip
        type='info'
        className={classNames('flex items-center gap-2', className)}
        content={
          <Text size='xs' className='w-[320px]'>
            {asset.campaign.tooltip}
          </Text>
        }
      >
        <>
          {withLogo ? (
            <div className={iconClasses}>
              <CampaignLogo campaignId={asset.campaign.id} />
            </div>
          ) : (
            <div className='w-1 h-1 ml-2 rounded-full bg-white/50' />
          )}
          <Text size={size} className={textClassName ? textClassName : asset.campaign.classNames}>
            {incentiveCopy}
          </Text>
        </>
      </Tooltip>
    </div>
  )
}
