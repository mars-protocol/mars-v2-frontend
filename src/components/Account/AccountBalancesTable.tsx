import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames'
import React from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { SortAsc, SortDesc, SortNone } from 'components/Icons'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import useStore from 'store'
import { convertToDisplayAmount, demagnify } from 'utils/formatters'

interface Props {
  data: Account
}

export const AcccountBalancesTable = (props: Props) => {
  const displayCurrency = useStore((s) => s.displayCurrency)
  const prices = useStore((s) => s.prices)
  const [sorting, setSorting] = React.useState<SortingState>([])

  const balanceData = React.useMemo<AccountBalanceRow[]>(() => {
    const accountDeposits = props.data?.deposits ?? []
    const accountLends = props.data?.lends ?? []

    const deposits = accountDeposits.map((deposit) => {
      const asset = ASSETS.find((asset) => asset.denom === deposit.denom) ?? ASSETS[0]
      const apy = 0
      return {
        type: 'deposit',
        symbol: asset.symbol,
        denom: deposit.denom,
        amount: deposit.amount,
        size: demagnify(deposit.amount, asset),
        value: convertToDisplayAmount(
          { amount: deposit.amount, denom: deposit.denom },
          displayCurrency,
          prices,
        ),
        apy,
      }
    })
    const lends = accountLends.map((lending) => {
      const asset = ASSETS.find((asset) => asset.denom === lending.denom) ?? ASSETS[0]
      const apy = 0
      return {
        type: 'lending',
        symbol: asset.symbol,
        denom: lending.denom,
        amount: lending.amount,
        size: demagnify(lending.amount, asset),
        value: convertToDisplayAmount(
          { amount: lending.amount, denom: lending.denom },
          displayCurrency,
          prices,
        ),
        apy,
      }
    })

    return [...deposits, ...lends]
  }, [displayCurrency, prices, props.data?.deposits, props.data?.lends])

  const columns = React.useMemo<ColumnDef<AccountBalanceRow>[]>(
    () => [
      {
        header: 'Asset',
        accessorKey: 'symbol',
        id: 'symbol',
        cell: ({ row }) => {
          return (
            <Text size='xs'>
              {row.original.symbol}
              {row.original.type === 'lending' && <span className='text-profit'>(Lent)</span>}
            </Text>
          )
        },
      },
      {
        header: 'Value',
        accessorKey: 'value',
        id: 'value',
        cell: ({ row }) => {
          return (
            <DisplayCurrency
              coin={{ denom: row.original.denom, amount: row.original.amount }}
              className='text-right text-xs'
            />
          )
        },
      },
      {
        id: 'size',
        accessorKey: 'size',
        header: 'Size',
        cell: ({ row }) => {
          return (
            <FormattedNumber
              className='text-right text-xs'
              amount={demagnify(
                row.original.amount,
                ASSETS.find((asset) => asset.denom === row.original.denom) ?? ASSETS[0],
              )}
              options={{ maxDecimals: 4 }}
            />
          )
        },
      },
      {
        id: 'apy',
        accessorKey: 'apy',
        header: 'APY',
        cell: ({ row }) => {
          return (
            <FormattedNumber
              className='text-xs'
              amount={row.original.apy}
              options={{ maxDecimals: 2, minDecimals: 2, suffix: '%' }}
            />
          )
        },
      },
    ],
    [],
  )

  const table = useReactTable({
    data: balanceData,
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
      <thead className='border-b border-b-white/5'>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, index) => {
              return (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={classNames(
                    'p-2',
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
          return (
            <tr key={row.id} className=' text-white/60'>
              {row.getVisibleCells().map((cell) => {
                const borderClass =
                  cell.row.original.type === 'deposit' ? 'border-profit' : 'border-loss'
                return (
                  <td
                    key={cell.id}
                    className={classNames(
                      cell.column.id === 'symbol' ? `border-l ${borderClass}` : 'pl-4 text-right',
                      'p-2',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
