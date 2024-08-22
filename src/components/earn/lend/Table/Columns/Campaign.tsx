import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'

export const CAMPAIGN_META = {
  sortEnabled: false,
  header: 'Campaign',
  id: 'campaign',
  meta: { className: 'min-w-40 flex flex-wrap gap-4' },
}

interface Props {
  asset?: Asset
  amount?: BigNumber
}

export default function Campaign(props: Props) {
  if (!props.asset || !props.asset.campaigns) return null
  return props.asset.campaigns.map((campaign, index) => {
    if (!props.asset) return null
    return (
      <AssetCampaignCopy
        asset={props.asset}
        withLogo
        size='sm'
        amount={props.amount}
        campaign={campaign}
        key={index}
      />
    )
  })
}
