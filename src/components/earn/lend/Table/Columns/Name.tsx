import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import AssetImage from 'components/common/assets/AssetImage'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

export const NAME_META = {
  accessorKey: 'asset.symbol',
  header: 'Asset',
  id: 'symbol',
  meta: { className: 'min-w-30' },
}
interface Props {
  asset: Asset
  v1?: boolean
  amount?: BigNumber
}
export default function Name(props: Props) {
  const { asset } = props

  const nonApyCampaigns = asset.campaigns.filter((campaign) => campaign.type !== 'apy')

  const subContent = props.v1 ? (
    nonApyCampaigns.map((campaign, index) => (
      <AssetCampaignCopy
        campaign={campaign}
        asset={props.asset}
        size='xs'
        noDot
        withLogo
        amount={props.amount}
        key={index}
      />
    ))
  ) : (
    <>
      <div>{asset.name}</div>
      {nonApyCampaigns.length > 0 && (
        <div className='flex flex-col gap-0.5 mt-0.5'>
          {nonApyCampaigns.map((campaign, index) => (
            <AssetCampaignCopy
              campaign={campaign}
              asset={asset}
              size='xs'
              noDot
              withLogo
              amount={props.amount}
              key={index}
            />
          ))}
        </div>
      )}
    </>
  )

  return (
    <div className='flex items-center flex-1 gap-3'>
      <AssetImage asset={asset} className='w-8 h-8 min-w-8 flex-shrink-0' />
      <TitleAndSubCell title={asset.symbol} sub={subContent} className='text-left min-w-15' />
    </div>
  )
}
