import { ColumnDef } from '@tanstack/react-table'
import React from 'react'

import AssetImage from 'components/Asset/AssetImage'
import AssetRate from 'components/Asset/AssetRate'
import Checkbox from 'components/Checkbox'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import Text from 'components/Text'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify, formatPercent } from 'utils/formatters'

function showBorrowRate(data: AssetTableRow[]) {
  const assetData = data.length && (data[0].asset as BorrowAsset)
  return !!(assetData && assetData?.borrowRate)
}

export default function useAssetTableColumns(isBorrow: boolean) {
  return React.useMemo<ColumnDef<AssetTableRow>[]>(
    () => [
      {
        header: 'Asset',
        accessorKey: 'symbol',
        id: 'symbol',
        cell: ({ row }) => {
          const market = row.original.market
          const borrowAsset = row.original.asset as BorrowAsset
          const showRate = !borrowAsset?.borrowRate
          const apy = isBorrow ? market?.apy.borrow : market?.apy.deposit

          return (
            <div className='flex items-center'>
              <Checkbox
                name={`asset-${borrowAsset.id.toLowerCase()}`}
                checked={row.getIsSelected()}
                onChange={row.getToggleSelectedHandler()}
                noMouseEvents
              />
              <AssetImage asset={borrowAsset} size={24} className='ml-4' />
              <div className='ml-2 text-left'>
                <Text size='sm' className='mb-0.5 text-white'>
                  {borrowAsset.symbol}
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
                  <Text size='xs'>{borrowAsset.name}</Text>
                )}
              </div>
            </div>
          )
        },
      },
      {
        id: 'details',
        header: (data) => {
          const tableData = data.table.options.data as AssetTableRow[]
          if (showBorrowRate(tableData)) return 'Borrow Rate'
          return 'Balance'
        },
        cell: ({ row }) => {
          const asset = row.original.asset as BorrowAsset
          const balance = row.original.balance
          if (asset?.borrowRate)
            return (
              <Text size='sm' className='mb-0.5 text-white'>
                {formatPercent(asset.borrowRate ?? 0)}
              </Text>
            )
          if (!balance) return null
          const coin = new BNCoin({ denom: row.original.asset.denom, amount: balance })
          return (
            <div className='flex flex-wrap items-center'>
              <DisplayCurrency coin={coin} className='mb-0.5 w-full text-white' />
              <FormattedNumber
                className='w-full text-xs'
                options={{ minDecimals: 2, maxDecimals: asset.decimals }}
                amount={demagnify(balance, asset)}
              />
            </div>
          )
        },
      },
    ],
    [isBorrow],
  )
}
