import Text from 'components/common/Text'
import AssetImage from 'components/common/assets/AssetImage'
import useAssets from 'hooks/assets/useAssets'
export const ASSET_META = {
  accessorKey: 'symbol',
  header: 'Asset',
  id: 'symbol',
  meta: { className: 'min-w-35 w-35' },
}

interface Props {
  symbol: string
  type: PositionType
}

export default function Asset(props: Props) {
  const { symbol, type } = props
  const { data: assets } = useAssets()
  const asset = assets.find((asset) => asset.symbol === symbol) ?? assets[0]

  return (
    <div className='flex gap-2'>
      <AssetImage asset={asset} className='w-4 h-4' />
      <Text size='xs' className='text-white'>
        {asset.symbol}
        {type === 'bridge' && <span className='ml-1 text-white/50'>(bridge)</span>}
        {type === 'borrow' && <span className='ml-1 text-loss'>(debt)</span>}
        {type === 'lend' && <span className='ml-1 text-profit'>(lent)</span>}
        {type === 'vault' && <span className='ml-1 text-profit'>(farm)</span>}
      </Text>
    </div>
  )
}
