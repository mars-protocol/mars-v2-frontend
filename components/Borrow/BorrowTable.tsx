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

import ChevronUpIcon from 'components/Icons/collapse.svg'
import ChevronDownIcon from 'components/Icons/expand.svg'
import { formatCurrency } from 'utils/formatters'

import AssetRow from './AssetRow'

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

type Props = {
  data: Market[]
  onBorrowClick: (denom: string) => void
  onRepayClick: (denom: string) => void
}

const BorrowTable = ({ data, onBorrowClick, onRepayClick }: Props) => {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo<ColumnDef<Market>[]>(
    () => [
      {
        header: 'Asset',
        id: 'symbol',
        accessorFn: (row) => (
          <div className='flex flex-1 items-center'>
            <Image src={row.icon} alt='token' width={32} height={32} />
            <div className='pl-2'>
              <div>{row.symbol}</div>
              <div className='text-xs'>{row.chain}</div>
            </div>
          </div>
        ),
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'borrowRate',
        header: 'Borrow Rate',
        accessorFn: (row) => (
          <div className='flex flex-1 items-center text-xs'>
            {row.borrowRate ? `${(row.borrowRate * 100).toFixed(2)}%` : '-'}
          </div>
        ),
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'age',
        header: 'Borrowed',
        accessorFn: (row) => (
          <div className='flex flex-1 items-center text-xs'>
            {row.borrowed ? (
              <div>
                <div className='font-bold'>{row.borrowed.amount}</div>
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
        header: 'Liquidity Available',
      },
      {
        accessorKey: 'status',
        enableSorting: false,
        header: 'Manage',
        width: 150,
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <div className='w-5'>
              {row.getIsExpanded() ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </div>
          </div>
        ),
      },
    ],
    [],
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
    <div className='w-full table-fixed border-spacing-10 text-sm'>
      {table.getHeaderGroups().map((headerGroup) => (
        <div key={headerGroup.id} className='mb-2 flex rounded-md px-4 py-2 text-xs'>
          {headerGroup.headers.map((header) => {
            return (
              <div key={header.id} className={`${header.index === 4 ? 'w-[50px]' : 'flex-1'}`}>
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
              </div>
            )
          })}
        </div>
      ))}
      <div className='flex flex-col gap-2'>
        {table.getRowModel().rows.length === 0 ? (
          <div>No Data</div>
        ) : (
          table.getRowModel().rows.map((row) => {
            return (
              <AssetRow
                key={row.index}
                data={row.original}
                onBorrowClick={() => onBorrowClick(row.original.denom)}
                onRepayClick={() => onRepayClick(row.original.denom)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

export default BorrowTable
