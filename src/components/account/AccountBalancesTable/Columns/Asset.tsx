import Text from 'components/common/Text'
import AssetImage from 'components/common/assets/AssetImage'
export const ASSET_META = { accessorKey: 'symbol', header: 'Asset', id: 'symbol' }

interface Props {
  asset: Asset
  type: PositionType
}

export default function Asset(props: Props) {
  const { asset, type } = props
  return (
    <div className='flex gap-2'>
      <AssetImage asset={asset} size={16} />
      <Text size='xs'>
        {asset.symbol}
        {type === 'borrow' && <span className='ml-1 text-loss'>(debt)</span>}
        {type === 'lend' && <span className='ml-1 text-profit'>(lent)</span>}
        {type === 'vault' && <span className='ml-1 text-profit'>(farm)</span>}
      </Text>
    </div>
  )
}
