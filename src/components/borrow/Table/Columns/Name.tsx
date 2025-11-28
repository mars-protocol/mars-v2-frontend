import AssetImage from 'components/common/assets/AssetImage'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

export const NAME_META = {
  accessorKey: 'asset.symbol',
  header: 'Asset',
  id: 'symbol',
  meta: { className: 'min-w-30' },
}

interface Props {
  data: BorrowMarketTableData
  v1?: boolean
}

export default function Name(props: Props) {
  const { asset } = props.data
  return (
    <div className='flex items-center flex-1 gap-3'>
      <AssetImage asset={asset} className='w-8 h-8 min-w-8 flex-shrink-0' />
      <TitleAndSubCell
        title={asset.symbol}
        sub={props.v1 ? '' : asset.name}
        className='text-left min-w-15'
      />
    </div>
  )
}
