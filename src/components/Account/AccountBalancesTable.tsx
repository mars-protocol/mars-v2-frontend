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
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { convertToDisplayAmount, demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  data: Account
}

export const AccountBalancesTable = (props: Props) => {
  const displayCurrency = useStore((s) => s.displayCurrency)
  const { data: prices } = usePrices()

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
          new BNCoin({ amount: deposit.amount, denom: deposit.denom }),
          displayCurrency,
          prices,
        ).toString(),
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
          new BNCoin({ amount: lending.amount, denom: lending.denom }),
          displayCurrency,
          prices,
        ).toString(),
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
          const coin = new BNCoin({ denom: row.original.denom, amount: row.original.amount })
          return <DisplayCurrency coin={coin} className='text-right text-xs' />
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
              amount={BN(
                demagnify(
                  row.original.amount,
                  ASSETS.find((asset) => asset.denom === row.original.denom) ?? ASSETS[0],
                ),
              )}
              options={{ maxDecimals: 4 }}
              animate
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
              amount={BN(row.original.apy)}
              options={{ maxDecimals: 2, minDecimals: 2, suffix: '%' }}
              animate
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
  })

  return (
    <table className='w-full'>
      <thead className='border-b border-white/5'>
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
