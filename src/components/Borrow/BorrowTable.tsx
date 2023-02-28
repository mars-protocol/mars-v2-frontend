'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import Image from 'next/image'
import React from 'react'
import classNames from 'classnames'

import { AssetRow } from 'components/Borrow/AssetRow'
import { ChevronDown, ChevronUp } from 'components/Icons'
import { getMarketAssets } from 'utils/assets'
import { Text } from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { FormattedNumber } from 'components/FormattedNumber'
import AmountAndValue from 'components/AmountAndValue'
import { formatPercent } from 'utils/formatters'

import AssetExpanded from './AssetExpanded'

type Props = {
  data: BorrowAsset[] | BorrowAssetActive[]
}

export const BorrowTable = (props: Props) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const marketAssets = getMarketAssets()

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
              <Image src={asset.logo} alt='token' width={32} height={32} />
              <TitleAndSubCell title={asset.symbol} sub={asset.name} />
            </div>
          )
        },
      },
      {
        accessorKey: 'borrowRate',
        header: 'Borrow Rate',
        cell: ({ row }) => (
          <Text className='justify-end' size='sm'>
            {formatPercent(row.original.borrowRate)}
          </Text>
        ),
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
            <div className='w-5'>{row.getIsExpanded() ? <ChevronUp /> : <ChevronDown />}</div>
          </div>
        ),
      },
    ],
    [],
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
    debugTable: true,
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
                    {header.column.getCanSort()
                      ? {
                          asc: (
                            <Image src='/images/sort-asc.svg' alt='mars' width={24} height={24} />
                          ),
                          desc: (
                            <Image src='/images/sort-desc.svg' alt='mars' width={24} height={24} />
                          ),
                          false: (
                            <Image src='/images/sort-none.svg' alt='mars' width={24} height={24} />
                          ),
                        }[header.column.getIsSorted() as string] ?? null
                      : null}
                    <Text tag='span' size='sm' className='font-normal text-white/40'>
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
