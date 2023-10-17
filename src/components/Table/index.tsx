import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames'
import React from 'react'

import VaultExpanded from 'components/Earn/Farm/VaultExpanded'
import { VaultRow } from 'components/Earn/Farm/VaultRow'
import { SortAsc, SortDesc, SortNone } from 'components/Icons'

import Text from '../Text'

interface Props {
  columns: ColumnDef<any>[]
  data: unknown[]
  initialSorting: SortingState
}

export default function Table(props: Props) {
  const [sorting, setSorting] = React.useState<SortingState>(props.initialSorting)

  const table = useReactTable({
    data: props.data,
    columns: props.columns,
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
            {headerGroup.headers.map((header) => {
              return (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={classNames(
                    'px-4 py-3',
                    header.column.getCanSort() && 'hover:cursor-pointer',
                    header.id === 'symbol' ? 'text-left' : 'text-right',
                  )}
                >
                  <div
                    className={classNames(
                      'flex',
                      header.id === 'name' ? 'justify-start' : 'justify-end',
                      'align-center',
                    )}
                  >
                    <span className='w-6 h-6 text-white'>
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
                {getExpandedRowModel('farm', row, table.resetExpanded)}
              </React.Fragment>
            )
          }

          return getRowModel('farm', row, table.resetExpanded)
        })}
      </tbody>
    </table>
  )
}

function getExpandedRowModel(
  type: 'farm',
  row: unknown,
  resetExpanded: (defaultState?: boolean | undefined) => void,
) {
  switch (type) {
    case 'farm':
      return (
        <>
          <VaultRow row={row as Row<Vault>} resetExpanded={resetExpanded} />
          <VaultExpanded row={row as Row<Vault>} resetExpanded={resetExpanded} />
        </>
      )
  }
}

function getRowModel(
  type: 'farm',
  row: Row<unknown>,
  resetExpanded: (defaultState?: boolean | undefined) => void,
) {
  return (
    <VaultRow
      key={(row as Row<Vault>).original.address}
      row={row as Row<Vault>}
      resetExpanded={resetExpanded}
    />
  )
}
