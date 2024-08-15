import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'

export const CAMPAIGN_META = {
  accessorKey: 'asset.campaign.id',
  header: 'Campaign',
  id: 'campaign',
  sortDescFirst: false,
  meta: { className: 'min-w-40' },
}

interface Props {
  asset?: Asset
  amount?: BigNumber
}

export default function Apr(props: Props) {
  if (!props.asset || !props.asset.campaign) return null

  return <AssetCampaignCopy asset={props.asset} withLogo size='sm' amount={props.amount} />
}
