'use client'

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

import { AssetRow } from 'components/Account/AssetRow'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { SortAsc, SortDesc, SortNone } from 'components/Icons'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import { demagnify } from 'utils/formatters'

interface Props {
  data: Account
}

export const AcccountBalancesTable = (props: Props) => {
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
        apy: apy,
      }
    })
    const lends = accountLends.map((lends) => {
      const asset = ASSETS.find((asset) => asset.denom === lends.denom) ?? ASSETS[0]
      const apy = 0
      return {
        type: 'debt',
        symbol: asset.symbol,
        denom: lends.denom,
        amount: lends.amount,
        apy: apy,
      }
    })

    return [...deposits, ...lends]
  }, [props.data.id])

  console.log(balanceData)

  const columns = React.useMemo<ColumnDef<AccountBalanceRow>[]>(
    () => [
      {
        header: 'Asset',
        accessorKey: 'symbol',
        id: 'symbol',
        cell: ({ row }) => {
          return <Text size='xs'>{row.original.symbol}</Text>
        },
      },
      {
        header: 'Value',
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
    [props.data.id],
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
          return <AssetRow key={row.index} row={row} />
        })}
      </tbody>
    </table>
  )
}
