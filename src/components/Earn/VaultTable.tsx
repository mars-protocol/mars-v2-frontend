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

import VaultLogo from 'components/Earn/VaultLogo'
import { VaultRow } from 'components/Earn/VaultRow'
import { ChevronDown, SortAsc, SortDesc, SortNone } from 'components/Icons'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { VAULT_DEPOSIT_BUFFER } from 'constants/vaults'
import { getAssetByDenom } from 'utils/assets'
import { convertPercentage, formatPercent, formatValue } from 'utils/formatters'

type Props = {
  data: Vault[]
}

export const VaultTable = (props: Props) => {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo<ColumnDef<Vault>[]>(
    () => [
      {
        header: 'Vault',
        id: 'address',
        cell: ({ row }) => {
          return <VaultLogo vault={row.original} />
        },
      },
      {
        accessorKey: 'apy',
        header: 'APY',
        cell: ({ row }) => {
          return <Text size='xs'>{row.original.apy ? formatPercent(row.original.apy) : '-'}</Text>
        },
      },
      {
        accessorKey: 'tvl',
        header: 'TVL',
        cell: ({ row }) => {
          // TODO: Replace with DisplayCurrency
          const symbol = getAssetByDenom(row.original.cap.denom)?.symbol ?? ''
          return (
            <Text size='xs'>
              {formatValue(row.original.cap.used, { abbreviated: true, suffix: ` ${symbol}` })}
            </Text>
          )
        },
      },
      {
        accessorKey: 'cap',
        header: 'Depo. Cap',
        cell: ({ row }) => {
          const percent = convertPercentage(
            (row.original.cap.used / (row.original.cap.max * VAULT_DEPOSIT_BUFFER)) * 100,
          )
          const decimals = getAssetByDenom(row.original.cap.denom)?.decimals ?? 6

          // TODO: Replace with DisplayCurrency
          return (
            <TitleAndSubCell
              className='text-xs'
              title={formatValue(row.original.cap.max, { abbreviated: true, decimals })}
              sub={`${percent}% Filled`}
            />
          )
        },
      },
      {
        accessorKey: 'cap',
        enableSorting: false,
        header: 'Details',
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <div className={classNames('w-4', row.getIsExpanded() && 'rotate-180')}>
              <ChevronDown />
            </div>
          </div>
        ),
      },
    ],
    [props.data],
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
                      size='xs'
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
                <VaultRow row={row} resetExpanded={table.resetExpanded} />
              </React.Fragment>
            )
          }
          return (
            <VaultRow key={row.original.address} row={row} resetExpanded={table.resetExpanded} />
          )
        })}
      </tbody>
    </table>
  )
}
