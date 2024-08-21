import classNames from 'classnames'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import { CampaignLogo } from 'constants/campaigns'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import { useMemo } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { formatValue, getCoinValue } from 'utils/formatters'

interface Props {
  asset: Asset
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  className?: string
  textClassName?: string
  withLogo?: boolean
  amount?: BigNumber
  noDot?: boolean
}

interface CopyProps extends Props {
  isV1: boolean
}

export default function AssetCampaignCopyController(props: Props) {
  const { asset, withLogo } = props
  const isV1 = useStore((s) => s.isV1)
  if (!asset.campaign) return null
  if (!asset.campaign.enabledOnV1 && isV1 && !withLogo) return null

  return <AssetCampaignCopy isV1={isV1} {...props} />
}

function AssetCampaignCopy(props: CopyProps) {
  const { asset, className, amount, withLogo, size, textClassName, noDot, isV1 } = props
  const { data: assets } = useAssets()
  const account = useCurrentAccount()

  const incentiveCopy = useMemo(() => {
    if (!asset.campaign) return ''
    if (!asset.campaign.enabledOnV1 && isV1) return asset.campaign.v1Tooltip
    if (
      !amount ||
      amount.isZero() ||
      asset.campaign.type === 'apy' ||
      !asset.campaign.baseMultiplier
    )
      return asset.campaign.incentiveCopy

    const tokenValue = getCoinValue(BNCoin.fromDenomAndBigNumber(asset.denom, amount), assets)
    const detailedCopy = asset.campaign.detailedIncentiveCopy
    const hasDebt = account?.debts && account.debts.length > 0
    const activeCollateralMultiplier =
      asset.campaign?.collateralMultiplier ?? asset.campaign.baseMultiplier
    const multiplier = hasDebt ? activeCollateralMultiplier : asset.campaign.baseMultiplier

    const campaignPoints = tokenValue
      .times(multiplier ?? 0)
      .integerValue()
      .toString()

    let campaignDetailedCopy = detailedCopy

    if (asset.campaign?.collateralMultiplier) {
      campaignDetailedCopy = campaignDetailedCopy.replace(/\([^()]*\)/g, `(${multiplier}x)`)
    }

    return campaignDetailedCopy.replace(
      '##POINTS##',
      formatValue(campaignPoints, { maxDecimals: 0, minDecimals: 0, abbreviated: false }),
    )
  }, [account?.debts, amount, asset.campaign, asset.denom, assets, isV1])

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
          <Text size='xs' className='max-w-[320px]'>
            {isV1 && !asset.campaign.enabledOnV1
              ? 'This campaign is not available on v1.'
              : asset.campaign.tooltip}
          </Text>
        }
      >
        <>
          {withLogo ? (
            <div className={iconClasses}>
              <CampaignLogo campaignId={asset.campaign.id} />
            </div>
          ) : (
            <div
              className={classNames('w-1 h-1 ml-2 rounded-full bg-white/50', noDot && 'hidden')}
            />
          )}
          <Text size={size} className={textClassName ? textClassName : asset.campaign.classNames}>
            {incentiveCopy}
          </Text>
        </>
      </Tooltip>
    </div>
  )
}
