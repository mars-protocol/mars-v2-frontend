import React from 'react'

import AssetImage from 'components/Asset/AssetImage'
import TitleAndSubCell from 'components/TitleAndSubCell'

export const NAME_META = { accessorKey: 'asset.name', header: 'Asset', id: 'symbol' }

interface Props {
  data: BorrowMarketTableData
}

export default function Name(props: Props) {
  const { asset } = props.data
  return (
    <div className='flex items-center flex-1 gap-3'>
      <AssetImage asset={asset} size={32} />
      <TitleAndSubCell title={asset.symbol} sub={asset.name} className='text-left min-w-15' />
    </div>
  )
}
