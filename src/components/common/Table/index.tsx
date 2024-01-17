import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  Row as TanstackRow,
  Table as TanstackTable,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames'
import React from 'react'

import Card from 'components/common/Card'
import { SortAsc, SortDesc, SortNone } from 'components/common/Icons'
import Row from 'components/common/Table/Row'
import Text from 'components/common/Text'
import ConditionalWrapper from 'hocs/ConditionalWrapper'

interface Props<T> {
  title: string
  columns: ColumnDef<T>[]
  data: T[]
  initialSorting: SortingState
  renderExpanded?: (row: TanstackRow<T>, table: TanstackTable<T>) => JSX.Element
  tableBodyClassName?: string
  spacingClassName?: string
  isBalancesTable?: boolean
  hideCard?: boolean
  setRowSelection?: OnChangeFn<RowSelectionState>
  selectedRows?: RowSelectionState
}

export default function Table<T>(props: Props<T>) {
  const [sorting, setSorting] = React.useState<SortingState>(props.initialSorting)

  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    state: {
      sorting,
      rowSelection: props.selectedRows,
    },
    enableRowSelection: true,
    onRowSelectionChange: props.setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <ConditionalWrapper
      condition={!props.hideCard}
      wrapper={(children) => (
        <Card
          className={classNames('w-full', !props.isBalancesTable && 'h-fit bg-white/5')}
          title={props.title}
        >
          {children}
        </Card>
      )}
    >
      <table className={classNames('w-full', props?.tableBodyClassName)}>
        <thead className='border-b bg-black/20 border-white/10'>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={classNames(
                      props.spacingClassName ?? 'px-4 py-3',
                      header.column.getCanSort() && 'hover:cursor-pointer',
                      header.id === 'symbol' || header.id === 'name' ? 'text-left' : 'text-right',
                      header.column.columnDef.meta?.className,
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
                      <span className='w-5 h-5 my-auto text-white'>
                        {header.column.getCanSort()
                          ? {
                              asc: <SortAsc size={16} />,
                              desc: <SortDesc />,
                              false: <SortNone />,
                            }[header.column.getIsSorted() as string] ?? null
                          : null}
                      </span>
                      <Text
                        tag='span'
                        size='xs'
                        className='flex items-center font-normal text-white/60'
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
            <Row
              key={row.id}
              row={row}
              table={table}
              renderExpanded={props.renderExpanded}
              spacingClassName={props.spacingClassName}
              isBalancesTable={props.isBalancesTable}
              isSelectable={!!props.setRowSelection}
            />
          ))}
        </tbody>
      </table>
    </ConditionalWrapper>
  )
}
