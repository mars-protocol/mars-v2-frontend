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
import React, { ReactElement } from 'react'

import Card from 'components/common/Card'
import { SortAsc, SortDesc, SortNone } from 'components/common/Icons'
import Row from 'components/common/Table/Row'
import Text from 'components/common/Text'
import { LEFT_ALIGNED_ROWS } from 'constants/table'
import ConditionalWrapper from 'hocs/ConditionalWrapper'

interface Props<T> {
  title: string | ReactElement
  columns: ColumnDef<T>[]
  data: T[]
  initialSorting: SortingState
  renderExpanded?: (row: TanstackRow<T>, table: TanstackTable<T>) => ReactElement
  tableBodyClassName?: string
  spacingClassName?: string
  type?: TableType
  hideCard?: boolean
  setRowSelection?: OnChangeFn<RowSelectionState>
  selectedRows?: RowSelectionState
  onClickRow?: (id: string) => void
  onSortingChange?: OnChangeFn<SortingState>
  disableSortingRow?: boolean
  titleComponent?: ReactElement
  isBalancesTable?: boolean
}

export default function Table<T>(props: Props<T>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(props.initialSorting)

  const sorting = props.onSortingChange ? props.initialSorting : internalSorting
  const onSortingChange = props.onSortingChange ?? setInternalSorting

  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    state: {
      sorting,
      rowSelection: props.selectedRows,
    },
    enableRowSelection: true,
    onRowSelectionChange: props.setRowSelection,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <ConditionalWrapper
      condition={!props.hideCard}
      wrapper={(children) => (
        <Card
          className={classNames('w-full', props.type !== 'balances' && 'h-fit')}
          contentClassName='max-w-full overflow-x-auto scrollbar-hide'
          title={props.title}
        >
          {children}
        </Card>
      )}
    >
      <div className='w-full'>
        <div className='w-full overflow-x-auto scrollbar-hide'>
          <table className={classNames('w-[calc(100%-1px)]', props?.tableBodyClassName)}>
            {!props.disableSortingRow && (
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
                            LEFT_ALIGNED_ROWS.includes(header.id) ? 'text-left' : 'text-right',
                            header.column.columnDef.meta?.className,
                          )}
                        >
                          <div
                            className={classNames(
                              'flex',
                              LEFT_ALIGNED_ROWS.includes(header.id)
                                ? 'justify-start'
                                : 'justify-end',
                              'align-center relative',
                            )}
                          >
                            <Text
                              tag='span'
                              size='xs'
                              className='flex items-center font-normal text-white/60'
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </Text>
                            {header.column.getCanSort() && (
                              <span
                                className={classNames(
                                  'w-5 h-5 my-auto text-white',
                                  !LEFT_ALIGNED_ROWS.includes(header.id) &&
                                    'absolute -mr-4.5 -translate-y-1/2 top-1/2',
                                )}
                              >
                                {header.column.getCanSort()
                                  ? ({
                                      asc: <SortAsc size={16} />,
                                      desc: <SortDesc />,
                                      false: <SortNone className='opacity-20' />,
                                    }[header.column.getIsSorted() as string] ?? null)
                                  : null}
                              </span>
                            )}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
            )}
            {props.titleComponent && (
              <tbody>
                <tr>
                  <td colSpan={table.getAllColumns().length} className='p-0'>
                    {props.titleComponent}
                  </td>
                </tr>
              </tbody>
            )}
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <Row
                  key={row.id}
                  row={row}
                  table={table}
                  renderExpanded={props.renderExpanded}
                  spacingClassName={props.spacingClassName}
                  isSelectable={!!props.setRowSelection}
                  type={props.type}
                  onClick={props.onClickRow}
                  isBalancesTable={props.isBalancesTable}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ConditionalWrapper>
  )
}
