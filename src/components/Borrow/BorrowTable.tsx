import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames'
import Image from 'next/image'
import React from 'react'

import AmountAndValue from 'components/AmountAndValue'
import AssetExpanded from 'components/Borrow/AssetExpanded'
import { AssetRow } from 'components/Borrow/AssetRow'
import { ChevronDown, SortAsc, SortDesc, SortNone } from 'components/Icons'
import Loading from 'components/Loading'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { getEnabledMarketAssets } from 'utils/assets'
import { formatPercent } from 'utils/formatters'
import AssetImage from 'components/AssetImage'

type Props = {
  data: BorrowAsset[] | BorrowAssetActive[]
}

export const BorrowTable = (props: Props) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const marketAssets = getEnabledMarketAssets()

  const columns = React.useMemo<ColumnDef<BorrowAsset | BorrowAssetActive>[]>(
    () => [
      {
        header: 'Asset',
        id: 'symbol',
        cell: ({ row }) => {
          const asset = marketAssets.find((asset) => asset.denom === row.original.denom)

          if (!asset) return null

          return (
            <div className='flex flex-1 items-center gap-3'>
              <AssetImage asset={asset} size={32} />
              <TitleAndSubCell
                title={asset.symbol}
                sub={asset.name}
                className='min-w-15 text-left'
              />
            </div>
          )
        },
      },
      {
        accessorKey: 'borrowRate',
        header: 'Borrow Rate',
        cell: ({ row }) => {
          if (row.original.borrowRate === null) {
            return <Loading />
          }

          return (
            <Text className='justify-end' size='sm'>
              {formatPercent(row.original.borrowRate, 2)}
            </Text>
          )
        },
      },
      ...((props.data[0] as BorrowAssetActive)?.debt
        ? [
            {
              accessorKey: 'debt',
              header: 'Borrowed',
              cell: (info: any) => {
                const borrowAsset = info.row.original as BorrowAssetActive
                const asset = marketAssets.find((asset) => asset.denom === borrowAsset.denom)

                if (!asset) return null

                return <AmountAndValue asset={asset} amount={borrowAsset.debt} />
              },
            },
          ]
        : []),
      {
        accessorKey: 'liquidity',
        header: 'Liquidity Available',
        cell: ({ row }) => {
          const asset = marketAssets.find((asset) => asset.denom === row.original.denom)

          if (!asset) return null

          if (row.original.liquidity === null) {
            return <Loading />
          }

          return <AmountAndValue asset={asset} amount={row.original.liquidity.amount} />
        },
      },
      {
        accessorKey: 'status',
        enableSorting: false,
        header: 'Manage',
        width: 150,
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <div className={classNames('w-4', row.getIsExpanded() && 'rotate-180')}>
              <ChevronDown />
            </div>
          </div>
        ),
      },
    ],
    [marketAssets, props.data],
  )

  const table = useReactTable({
    data: props.data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <table className='w-full'>
      <thead className='bg-black/20'>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, index) => {
              return (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={classNames(
                    'px-4 py-3',
                    header.column.getCanSort() && 'cursor-pointer',
                    header.id === 'symbol' ? 'text-left' : 'text-right',
                  )}
                >
                  <div
                    className={classNames(
                      'flex',
                      header.id === 'symbol' ? 'justify-start' : 'justify-end',
                      'align-center',
                    )}
                  >
                    <span className='h-6 w-6 text-white'>
                      {header.column.getCanSort()
                        ? {
                            asc: <SortAsc />,
                            desc: <SortDesc />,
                            false: <SortNone />,
                          }[header.column.getIsSorted() as string] ?? null
                        : null}
                    </span>
                    <Text
                      tag='span'
                      size='sm'
                      className='flex items-center font-normal text-white/40'
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Text>
                  </div>
                </th>
              )
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => {
          if (row.getIsExpanded()) {
            return (
              <React.Fragment key={`${row.id}_subrow`}>
                <AssetRow key={`${row.id}_asset`} row={row} resetExpanded={table.resetExpanded} />
                <AssetExpanded
                  key={`${row.id}_expanded`}
                  row={row}
                  onBorrowClick={() => {}}
                  onRepayClick={() => {}}
                  resetExpanded={table.resetExpanded}
                />
              </React.Fragment>
            )
          }
          return <AssetRow key={row.index} row={row} resetExpanded={table.resetExpanded} />
        })}
      </tbody>
    </table>
  )
}
