import Text from 'components/Text'
import { ColumnDef } from '@tanstack/react-table'
import React from 'react'
import Checkbox from 'components/Checkbox'
import Image from 'next/image'
import { formatPercent } from 'utils/formatters'
import { getAssetByDenom } from 'utils/assets'

export default function useAssetTableColumns() {
  const columns = React.useMemo<ColumnDef<BorrowAsset>[]>(
    () => [
      {
        header: 'Asset',
        accessorKey: 'symbol',
        id: 'symbol',
        cell: ({ row }) => {
          const asset = getAssetByDenom(row.original.denom)
          if (!asset) return null

          return (
            <div className='flex items-center'>
              <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
              <Image src={asset.logo} alt={asset.symbol} width={24} height={24} className='ml-4' />
              <div className='ml-2 text-left'>
                <Text size='sm' className='mb-0.5 text-white'>
                  {asset.symbol}
                </Text>
                <Text size='xs'>{asset.name}</Text>
              </div>
            </div>
          )
        },
      },
      {
        id: 'borrowRate',
        accessorKey: 'borrowRate',
        header: 'Borrow Rate',
        cell: ({ row }) => (
          <>
            <Text size='sm' className='mb-0.5 text-white'>
              {formatPercent(row.original.borrowRate ?? 0)}
            </Text>
            <Text size='xs'>APY</Text>
          </>
        ),
      },
    ],
    [],
  )

  return columns
}
