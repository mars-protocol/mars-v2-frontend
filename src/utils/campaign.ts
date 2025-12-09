import { byDenom } from 'utils/array'
import { formatValue, getCoinValue } from 'utils/formatters'

export function getDailyAccountPoints(
  account: Account,
  campaign: AssetCampaign,
  chainConfig: ChainConfig,
  assets: Asset[],
): string {
  const collateral = [...account.lends, ...account.stakedAstroLps]
  const debt = account.debts ?? []
  const campaignAssets = chainConfig.campaignAssets?.filter((asset) =>
    asset.campaignIds.includes(campaign.id),
  )

  if (!campaignAssets || collateral.length === 0) return '0'
  const activeCampaignPositions = collateral.filter((position) => {
    return campaignAssets?.some((campaignAsset) => campaignAsset.denom === position.denom)
  })

  if (activeCampaignPositions.length === 0) return '0'
  let points = 0
  activeCampaignPositions.forEach((position) => {
    const positionValue = getCoinValue(position, assets)
    const campaignAsset = campaignAssets.find(byDenom(position.denom))
    if (!campaignAsset) return
    const multiplier =
      debt.length > 0 && campaignAsset.collateralMultiplier
        ? campaignAsset.collateralMultiplier
        : campaignAsset.baseMultiplier

    points += positionValue
      .times(multiplier ?? 0)
      .integerValue()
      .toNumber()
  })

  return formatValue(points, { maxDecimals: 0, minDecimals: 0, abbreviated: false })
}
