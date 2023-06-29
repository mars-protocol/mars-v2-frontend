import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  Table,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames'
import React from 'react'

import Card from 'components/Card'
import { SortAsc, SortDesc, SortNone } from 'components/Icons'
import Text from 'components/Text'

interface Props<TData> {
  title: string
  data: TData[]
  columns: ColumnDef<TData>[]
  sorting?: SortingState
  rowRenderer: (row: Row<TData>, table: Table<TData>) => JSX.Element
}

function AssetListTable<TData>(props: Props<TData>) {
  const { title, data, columns } = props
  const [sorting, setSorting] = React.useState<SortingState>(props.sorting ?? [])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const _rowRenderer = (row: Row<TData>) => props.rowRenderer(row, table)

  if (!data.length) return null

  return (
    <Card className='mb-4 h-fit w-full bg-white/5' title={title}>
      <table className='w-full'>
        <thead className='border-b border-white border-opacity-10 bg-black/20'>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={classNames(
                      'px-4 py-3',
                      header.column.getCanSort() && 'cursor-pointer',
                      header.id === 'symbol' ? 'text-left' : 'text-right',
                      {
                        'w-32': header.id === 'manage',
                        'w-48': header.id === 'depositCap',
                      },
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
        <tbody>{table.getRowModel().rows.map(_rowRenderer)}</tbody>
      </table>
    </Card>
  )
}

export default AssetListTable
