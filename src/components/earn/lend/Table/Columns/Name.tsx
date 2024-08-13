import { isMobile } from 'react-device-detect'

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
}
export default function Name(props: Props) {
  const { asset } = props
  console.log(asset.symbol, asset.denom)
  return (
    <div className='flex items-center flex-1 gap-3'>
      <AssetImage asset={asset} className='w-8 h-8' />
      <TitleAndSubCell
        title={asset.symbol}
        sub={props.v1 && !isMobile ? '' : asset.name}
        className='text-left min-w-15'
      />
    </div>
  )
}
