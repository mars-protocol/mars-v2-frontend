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
  campaign: AssetCampaign
  account?: Account
  hasDebt?: boolean
}

interface CopyProps extends Props {
  isV1: boolean
}

export default function AssetCampaignCopyController(props: Props) {
  const { asset, withLogo, campaign } = props
  const currentAccount = useCurrentAccount()
  const isV1 = useStore((s) => s.isV1)
  if (!asset.campaigns || asset.campaigns.length === 0) return null
  if (!campaign.enabledOnV1 && isV1 && !withLogo) return null

  return <AssetCampaignCopy isV1={isV1} {...props} account={props.account ?? currentAccount} />
}

function AssetCampaignCopy(props: CopyProps) {
  const {
    asset,
    className,
    amount,
    withLogo,
    size,
    textClassName,
    noDot,
    isV1,
    campaign,
    account,
  } = props
  const { data: assets } = useAssets()
  const incentiveCopy = useMemo(() => {
    if (!campaign) return ''
    if (!campaign.enabledOnV1 && isV1) return campaign.v1Tooltip
    if (!amount || amount.isZero() || campaign.type === 'apy' || !campaign.baseMultiplier)
      return campaign.incentiveCopy

    const tokenValue = getCoinValue(BNCoin.fromDenomAndBigNumber(asset.denom, amount), assets)
    const detailedCopy = campaign.detailedIncentiveCopy
    const hasDebt = props.hasDebt || (account?.debts && account.debts.length > 0)
    const activeCollateralMultiplier = campaign?.collateralMultiplier ?? campaign.baseMultiplier
    const multiplier = hasDebt ? activeCollateralMultiplier : campaign.baseMultiplier

    const campaignPoints = tokenValue
      .times(multiplier ?? 0)
      .integerValue()
      .toString()

    let campaignDetailedCopy = detailedCopy

    if (campaign?.collateralMultiplier) {
      campaignDetailedCopy = campaignDetailedCopy.replace(/\([^()]*\)/g, `(${multiplier}x)`)
    }

    return campaignDetailedCopy.replace(
      '##POINTS##',
      formatValue(campaignPoints, { maxDecimals: 0, minDecimals: 0, abbreviated: false }),
    )
  }, [campaign, isV1, amount, asset.denom, assets, props.hasDebt, account?.debts])

  const iconClasses = useMemo(() => {
    if (size === 'xs') return 'w-4 h-4'
    if (size === 'sm') return 'w-5 h-5'
    return 'w-6 h-6'
  }, [size])

  if (!campaign) return null

  return (
    <div>
      <Tooltip
        type='info'
        className={classNames('flex items-center gap-2', className)}
        content={
          <Text size='xs' className='max-w-80'>
            {isV1 && !campaign.enabledOnV1
              ? 'This campaign is not available on v1.'
              : campaign.tooltip}
          </Text>
        }
      >
        <>
          {withLogo ? (
            <div className={iconClasses}>
              <CampaignLogo campaignId={campaign.id} />
            </div>
          ) : (
            <div
              className={classNames('w-1 h-1 ml-2 rounded-full bg-white/50', noDot && 'hidden')}
            />
          )}
          <Text
            size={size}
            className={classNames(
              textClassName ? textClassName : campaign.classNames,
              'whitespace-nowrap',
            )}
          >
            {incentiveCopy}
          </Text>
        </>
      </Tooltip>
    </div>
  )
}
