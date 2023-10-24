import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  Row as TanstackRow,
  Table as TanstackTable,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames'
import React from 'react'

import Card from 'components/Card'
import { SortAsc, SortDesc, SortNone } from 'components/Icons'
import Row from 'components/Table/Row'
import Text from 'components/Text'

interface Props<T> {
  title: string
  columns: ColumnDef<T>[]
  data: T[]
  initialSorting: SortingState
  renderExpanded?: (row: TanstackRow<T>, table: TanstackTable<T>) => JSX.Element
}

export default function Table<T>(props: Props<T>) {
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
    <Card className='w-full h-fit bg-white/5' title={props.title}>
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
                      header.id === 'symbol' || header.id === 'name' ? 'text-left' : 'text-right',
                    )}
                  >
                    <div
                      className={classNames(
                        'flex',
                        header.id === 'symbol' || header.id === 'name'
                          ? 'justify-start'
                          : 'justify-end',
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
          {table.getRowModel().rows.map((row) => (
            <Row key={row.id} row={row} table={table} renderExpanded={props.renderExpanded} />
          ))}
        </tbody>
      </table>
    </Card>
  )
}
