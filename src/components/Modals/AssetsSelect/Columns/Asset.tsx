import { Row } from '@tanstack/react-table'

import Checkbox from 'components/common/Checkbox'
import Text from 'components/common/Text'
import AssetImage from 'components/common/assets/AssetImage'
import AssetRate from 'components/common/assets/AssetRate'

export const ASSET_META = { id: 'name', header: 'Asset', accessorKey: 'asset.symbol' }

interface Props {
  row: Row<AssetTableRow>
}

function isBorrowAsset(object?: any): object is BorrowAsset {
  if (!object) return false
  return 'borrowRate' in object
}

export default function Asset(props: Props) {
  const { row } = props
  const asset = row.original.asset
  const market = row.original.market
  const isBorrow = isBorrowAsset(asset)
  const showRate = !isBorrow && market?.borrowEnabled
  const apy = isBorrow ? market?.apy.borrow : market?.apy.deposit

  return (
    <div className='flex items-center'>
      <Checkbox
        name={`asset-${asset.id.toLowerCase()}`}
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        noMouseEvents
      />
      <AssetImage asset={asset} className='w-6 h-6 ml-4' />
      <div className='ml-2 text-left'>
        <Text size='sm' className='mb-0.5 text-white'>
          {asset.symbol}
        </Text>
        {showRate && market ? (
          <AssetRate
            rate={apy ?? 0}
            isEnabled={market.borrowEnabled}
            className='text-xs'
            type='apy'
            orientation='rtl'
            suffix
          />
        ) : (
          <Text size='xs'>{asset.name}</Text>
        )}
      </div>
    </div>
  )
}
