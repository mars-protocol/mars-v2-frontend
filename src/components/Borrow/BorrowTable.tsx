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

import { AssetRow } from 'components/Borrow/AssetRow'
import { ChevronDown, ChevronUp } from 'components/Icons'
import { getMarketAssets } from 'utils/assets'
import classNames from 'classnames'
import AssetExpanded from './AssetExpanded'

type Props = {
  data: BorrowAsset[] | BorrowAssetActive[]
}

export const BorrowTable = (props: Props) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const marketAssets = getMarketAssets()

  const columns = React.useMemo<ColumnDef<BorrowAsset>[]>(
    () => [
      {
        header: 'Asset',
        id: 'symbol',
        cell: ({ row }) => {
          const asset = marketAssets.find((asset) => asset.denom === row.original.denom)

          if (!asset) return null

          return (
            <div className='flex flex-1 items-center'>
              <Image src={asset.logo} alt='token' width={32} height={32} />
              <div className='pl-2'>
                <div>{asset.symbol}</div>
                <div className='text-xs'>{asset.name}</div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'borrowRate',
        header: 'Borrow Rate',
        cell: ({ row }) => <div>{(Number(row.original.borrowRate) * 100).toFixed(2)}%</div>,
      },
      {
        accessorKey: 'liquidity',
        header: 'Liquidity Available',
        cell: ({ row }) => (
          <div className='items-right flex flex-col'>
            <div className=''>{row.original.liquidity.amount}</div>
            <div className='text-xs opacity-60'>${row.original.liquidity.value}</div>
          </div>
        ),
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
      <thead className='bg-white/5'>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, index) => {
              return (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={classNames(
                    'px-4 py-2',
                    header.column.getCanSort() && 'cursor-pointer',
                    header.id === 'symbol' ? 'text-left' : 'text-right',
                  )}
                >
                  <div
                    className={classNames(
                      'flex',
                      header.id === 'symbol' ? 'justify-start' : 'justify-end',
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
                    <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
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
