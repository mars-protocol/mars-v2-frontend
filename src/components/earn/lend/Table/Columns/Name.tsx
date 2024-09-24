import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import AssetImage from 'components/common/assets/AssetImage'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

export const NAME_META = {
  accessorKey: 'asset.symbol',
  header: 'Asset',
  id: 'symbol',
  meta: { className: 'min-w-60 w-60' },
}
interface Props {
  asset: Asset
  v1?: boolean
  amount?: BigNumber
}
export default function Name(props: Props) {
  const { asset } = props
  return (
    <div className='flex items-center flex-1 gap-3'>
      <AssetImage asset={asset} className='w-8 h-8 min-w-8' />
      {props.v1 ? (
        <TitleAndSubCell
          title={asset.symbol}
          sub={asset.campaigns.map((campaign, index) => (
            <AssetCampaignCopy
              campaign={campaign}
              asset={props.asset}
              size='xs'
              noDot
              amount={props.amount}
              key={index}
            />
          ))}
          className='text-left min-w-15'
        />
      ) : (
        <TitleAndSubCell title={asset.symbol} sub={asset.name} className='text-left min-w-15' />
      )}
    </div>
  )
}
