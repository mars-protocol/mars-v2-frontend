import AssetImage from 'components/common/assets/AssetImage'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

export const PERP_NAME_META = {
  accessorKey: 'asset.symbol',
  header: 'Asset',
  id: 'symbol',
  meta: { className: 'min-w-40' },
}

type Props = {
  asset: Asset
}
export function PerpName(props: Props) {
  return (
    <div className='flex gap-3'>
      <AssetImage asset={props.asset} className='w-8 h-8' />
      <TitleAndSubCell title={props.asset.name} sub={`${props.asset.symbol}-USD`} />
    </div>
  )
}
