import React from 'react'
import Image from 'next/image'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'

import { formatCurrency } from 'utils/formatters'
import Button from 'components/Button'

interface Market {
  denom: string
  symbol: string
  icon: string
  chain: string
  borrowed: {
    amount: number
    value: number
  } | null
  borrowRate: number
  marketLiquidity: number
}

const data = [
  {
    denom: 'uosmo',
    symbol: 'OSMO',
    icon: '/tokens/osmo.svg',
    chain: 'Osmosis',
    borrowed: {
      amount: 2.005494,
      value: 2.2060434000000004,
    },
    borrowRate: 0.1,
    marketLiquidity: 1000000,
  },
  {
    denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    symbol: 'ATOM',
    icon: '/tokens/atom.svg',
    chain: 'Cosmos',
    borrowed: null,
    borrowRate: 0.25,
    marketLiquidity: 1000,
  },
  {
    denom: 'uusdc',
    symbol: 'USDC',
    icon: '/tokens/atom.svg',
    chain: 'Ethereum',
    borrowed: {
      amount: 100,
      value: 99.9776,
    },
    borrowRate: 0.35,
    marketLiquidity: 333,
  },
]

const BorrowTable = () => {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo<ColumnDef<Market>[]>(
    () => [
      {
        header: () => 'Asset',
        id: 'symbol',
        accessorFn: (row) => (
          <div className="flex flex-1 items-center">
            <Image src={row.icon} alt="token" width={32} height={32} />
            <div className="pl-2">
              <div>{row.symbol}</div>
              <div className="text-xs">{row.chain}</div>
            </div>
          </div>
        ),
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'borrowRate',
        // id: 'lastName',
        accessorFn: (row) => (
          <div className="flex flex-1 items-center text-xs">
            {row.borrowRate ? `${(row.borrowRate * 100).toFixed(2)}%` : '-'}
          </div>
        ),
        cell: (info) => info.getValue(),
        header: () => <span>Borrow Rate</span>,
      },
      {
        accessorKey: 'age',
        header: () => 'Borrowed',
        accessorFn: (row) => (
          <div className="flex flex-1 items-center text-xs">
            {row.borrowed ? (
              <div>
                <div className="font-bold">{row.borrowed.amount}</div>
                <div>{formatCurrency(row.borrowed.value)}</div>
              </div>
            ) : (
              '-'
            )}
          </div>
        ),
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'marketLiquidity',
        header: () => 'Liquidity Available',
      },
      {
        accessorKey: 'status',
        enableSorting: false,
        header: 'Manage',
        size: 50,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            {row.getIsExpanded() ? (
              <ChevronUpIcon className="w-5" />
            ) : (
              <ChevronDownIcon className="w-5" />
            )}
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data,
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
    <table className="w-full table-fixed border-spacing-10 text-sm">
      <thead className="px-4 py-2">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <th key={header.id} colSpan={header.colSpan} className="py-2 px-4">
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              )
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => {
          const isExpanded = row.getIsExpanded()

          return (
            <>
              <tr
                key={row.id}
                onClick={() => row.toggleExpanded()}
                className={`cursor-pointer ${isExpanded ? 'bg-black/50' : 'hover:bg-white/30'}`}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id} className="p-4" colSpan={1}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )
                })}
              </tr>
              {isExpanded && (
                <tr className="bg-black/50">
                  <td colSpan={row.getVisibleCells().length} className="py-2 px-4">
                    <div className="flex items-center justify-between">
                      <div>Additional Stuff Placeholder</div>
                      <div className="flex gap-2">
                        <Button
                          className="rounded-sm"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation()
                            alert('TODO')
                          }}
                        >
                          Borrow
                        </Button>
                        <Button
                          className="rounded-sm"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation()
                            alert('TODO')
                          }}
                        >
                          Repay
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          )
        })}
      </tbody>
    </table>
  )
}

export default BorrowTable
