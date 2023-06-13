import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import classNames from 'classnames'

import { SortAsc, SortDesc, SortNone } from 'components/Icons'
import Text from 'components/Text'
import useStore from 'store'
import useAddVaultAssetTableColumns from 'components/Modals/AddVaultAssets/useAddVaultAssetTableColumns'

interface Props {
  assets: BorrowAsset[]
}

export default function AddVaultAssetTable(props: Props) {
  const selectedBorrowDenoms = useStore((s) => s.selectedBorrowDenoms)

  const defaultSelected = props.assets.reduce((acc, asset, index) => {
    if (selectedBorrowDenoms.includes(asset.denom)) {
      acc[index] = true
    }
    return acc
  }, {} as { [key: string]: boolean })

  const [sorting, setSorting] = useState<SortingState>([{ id: 'symbol', desc: false }])
  const [selected, setSelected] = useState<RowSelectionState>(defaultSelected)
  const columns = useAddVaultAssetTableColumns()

  const table = useReactTable({
    data: props.assets,
    columns,
    state: {
      sorting,
      rowSelection: selected,
    },
    onRowSelectionChange: setSelected,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  useEffect(() => {
    const selectedDenoms = props.assets
      .filter((_, index) => selected[index])
      .map((asset) => asset.denom)
    const updatedBorrowDenoms = [...selectedBorrowDenoms]
    props.assets.forEach((asset) => {
      const isCurrentlySelected = selectedDenoms.includes(asset.denom)
      const isPreviouslySelected = selectedBorrowDenoms.includes(asset.denom)
      if (!isCurrentlySelected && isPreviouslySelected) {
        updatedBorrowDenoms.splice(selectedBorrowDenoms.indexOf(asset.denom), 1)
      } else if (isCurrentlySelected && !isPreviouslySelected) {
        updatedBorrowDenoms.push(asset.denom)
      }
    })
    useStore.setState({ selectedBorrowDenoms: updatedBorrowDenoms })
    // Ignore of selectedDenoms is required to prevent infinite loop.
    // THis is needed because sekectedDenoms is adjusted from 2 different tables.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, props.assets])

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
                return (
                  <td
                    key={cell.id}
                    className={classNames(
                      cell.column.id === 'select' ? `` : 'pl-4 text-right',
                      'px-4 py-3',
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
