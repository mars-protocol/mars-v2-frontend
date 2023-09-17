import { ColumnDef, Row, Table } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'

import AmountAndValue from 'components/AmountAndValue'
import AssetImage from 'components/Asset/AssetImage'
import BorrowActionButtons from 'components/Borrow/BorrowActionButtons'
import { FormattedNumber } from 'components/FormattedNumber'
import { ChevronDown, ChevronUp } from 'components/Icons'
import Loading from 'components/Loading'
import AssetListTable from 'components/MarketAssetTable'
import MarketAssetTableRow from 'components/MarketAssetTable/MarketAssetTableRow'
import MarketDetails from 'components/MarketAssetTable/MarketDetails'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { BN_ZERO } from 'constants/math'
import { getEnabledMarketAssets } from 'utils/assets'

interface Props {
  title: string
  data: BorrowMarketTableData[]
}

export default function BorrowTable(props: Props) {
  const { title, data } = props
  const shouldShowAccountBorrowed = !!data[0]?.debt
  const marketAssets = getEnabledMarketAssets()

  const rowRenderer = useCallback(
    (row: Row<BorrowMarketTableData>, table: Table<BorrowMarketTableData>) => {
      return (
        <MarketAssetTableRow
          key={`borrow-asset-${row.id}`}
          isExpanded={row.getIsExpanded()}
          resetExpanded={table.resetExpanded}
          rowData={row}
          expandedActionButtons={<BorrowActionButtons data={row.original} />}
          expandedDetails={<MarketDetails data={row.original} type='borrow' />}
        />
      )
    },
    [],
  )

  const columns = useMemo<ColumnDef<BorrowMarketTableData>[]>(
    () => [
      {
        accessorKey: 'asset.name',
        header: 'Asset',
        id: 'symbol',
        cell: ({ row }) => {
          const asset = row.original.asset

          return (
            <div className='flex items-center flex-1 gap-3'>
              <AssetImage asset={asset} size={32} />
              <TitleAndSubCell
                title={asset.symbol}
                sub={asset.name}
                className='text-left min-w-15'
              />
            </div>
          )
        },
      },
      ...(shouldShowAccountBorrowed
        ? [
            {
              accessorKey: 'debt',
              header: 'Borrowed',
              cell: (info: any) => {
                const borrowAsset = info.row.original as BorrowMarketTableData
                const asset = marketAssets.find((asset) => asset.denom === borrowAsset.asset.denom)

                if (!asset) return null

                return <AmountAndValue asset={asset} amount={borrowAsset?.debt ?? BN_ZERO} />
              },
            },
          ]
        : []),
      {
        accessorKey: 'borrowRate',
        header: 'Borrow Rate',
        cell: ({ row }) => {
          if (row.original.borrowRate === null) {
            return <Loading />
          }

          return (
            <FormattedNumber
              className='justify-end text-xs'
              amount={row.original.borrowRate * 100}
              options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
              animate
            />
          )
        },
      },
      {
        accessorKey: 'liquidity',
        header: 'Liquidity Available',
        cell: ({ row }) => {
          const { liquidity, asset: borrowAsset } = row.original
          const asset = marketAssets.find((asset) => asset.denom === borrowAsset.denom)

          if (!asset) return null

          if (liquidity === null) {
            return <Loading />
          }

          return <AmountAndValue asset={asset} amount={liquidity.amount ?? BN_ZERO} />
        },
      },
      {
        accessorKey: 'manage',
        enableSorting: false,
        header: 'Manage',
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <div className='w-4'>{row.getIsExpanded() ? <ChevronUp /> : <ChevronDown />}</div>
          </div>
        ),
      },
    ],
    [shouldShowAccountBorrowed, marketAssets],
  )

  return <AssetListTable title={title} rowRenderer={rowRenderer} columns={columns} data={data} />
}
