import { ColumnDef, Row, Table } from '@tanstack/react-table'
import Image from 'next/image'
import { useMemo } from 'react'

import AmountAndValue from 'components/AmountAndValue'
import BorrowActionButtons from 'components/Borrow/BorrowActionButtons'
import { FormattedNumber } from 'components/FormattedNumber'
import { ChevronDown, ChevronUp } from 'components/Icons'
import Loading from 'components/Loading'
import AssetListTable from 'components/MarketAssetTable'
import MarketAssetTableRow from 'components/MarketAssetTable/MarketAssetTableRow'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'
import { getEnabledMarketAssets } from 'utils/assets'
import { BN } from 'utils/helpers'
import MarketDetails from 'components/MarketAssetTable/MarketDetails'

interface Props {
  title: string
  data: BorrowMarketTableData[]
}

export default function BorrowTable(props: Props) {
  const { title, data } = props
  const { symbol: displayCurrencySymbol } = useDisplayCurrencyPrice()
  const shouldShowAccountBorrowed = !!data[0]?.debt
  const marketAssets = getEnabledMarketAssets()

  const rowRenderer = (row: Row<BorrowMarketTableData>, table: Table<BorrowMarketTableData>) => {
    return (
      <MarketAssetTableRow
        key={`borrow-asset-${row.id}`}
        isExpanded={row.getIsExpanded()}
        resetExpanded={table.resetExpanded}
        rowData={row}
        expandedActionButtons={<BorrowActionButtons data={row.original} />}
        expandedDetails={<MarketDetails data={row.original} />}
      />
    )
  }

  const columns = useMemo<ColumnDef<BorrowMarketTableData>[]>(
    () => [
      {
        accessorKey: 'asset.name',
        header: 'Asset',
        id: 'symbol',
        cell: ({ row }) => {
          const asset = row.original.asset

          return (
            <div className='flex flex-1 items-center gap-3'>
              <Image src={asset.logo} alt={asset.symbol} width={32} height={32} />
              <TitleAndSubCell
                title={asset.symbol}
                sub={asset.name}
                className='min-w-15 text-left'
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

                return <AmountAndValue asset={asset} amount={borrowAsset?.debt ?? BN(0)} />
              },
            },
          ]
        : []),
      {
        accessorKey: 'borrowRate',
        header: 'Borrow Rate',
        cell: ({ row }) => {
          return (
            <FormattedNumber
              className='justify-end text-xs'
              amount={BN(row.original.borrowRate ?? 0).multipliedBy(100)}
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
          const { liquidity, asset } = row.original
          const currentAsset = marketAssets.find((asset) => asset.denom === asset.denom)

          if (!currentAsset) return null

          if (row.original.liquidity === null) {
            return <Loading />
          }
          return <AmountAndValue asset={currentAsset} amount={liquidity?.amount ?? BN(0)} />
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
    [displayCurrencySymbol, shouldShowAccountBorrowed, marketAssets],
  )

  return <AssetListTable title={title} rowRenderer={rowRenderer} columns={columns} data={data} />
}
