import AssetImage from 'components/common/assets/AssetImage'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

export const NAME_META = { accessorKey: 'asset.symbol', header: 'Asset', id: 'symbol' }
interface Props {
  asset: Asset
}
export default function Name(props: Props) {
  const { asset } = props
  return (
    <div className='flex items-center flex-1 gap-3'>
      <AssetImage asset={asset} size={32} />
      <TitleAndSubCell title={asset.symbol} sub={asset.name} className='text-left min-w-15' />
    </div>
  )
}
