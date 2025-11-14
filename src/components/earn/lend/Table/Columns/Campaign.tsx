import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'

export const CAMPAIGN_META = {
  sortEnabled: false,
  header: 'Campaign',
  id: 'campaign',
  meta: { className: 'min-w-40 flex flex-wrap gap-4 min-h-[66px] items-center py-0!' },
}

interface Props {
  asset?: Asset
  amount?: BigNumber
}

export default function Campaign(props: Props) {
  const asset = props.asset
  if (!asset || asset.campaigns.length === 0) return null
  return asset.campaigns.map((campaign, index) => {
    return (
      <AssetCampaignCopy
        asset={asset}
        withLogo
        size='sm'
        amount={props.amount}
        campaign={campaign}
        key={index}
      />
    )
  })
}
