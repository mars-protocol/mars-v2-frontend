import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames'
import { useEffect, useMemo, useState } from 'react'

import { SortAsc, SortDesc, SortNone } from 'components/Icons'
import useAssetTableColumns from 'components/Modals/AssetsSelect/useAssetTableColumns'
import Text from 'components/Text'
import useMarketAssets from 'hooks/useMarketAssets'
import useStore from 'store'
import { byDenom } from 'utils/array'

interface Props {
  assets: Asset[] | BorrowAsset[]
  selectedDenoms: string[]
  onChangeSelected: (denoms: string[]) => void
  isBorrow: boolean
}

export default function AssetSelectTable(props: Props) {
  const { data: markets } = useMarketAssets()
  const defaultSelected = useMemo(() => {
    const assets = props.assets as BorrowAsset[]
    return assets.reduce(
      (acc, asset, index) => {
        if (props.selectedDenoms?.includes(asset.denom)) {
          acc[index] = true
        }
        return acc
      },
      {} as { [key: number]: boolean },
    )
  }, [props.selectedDenoms, props.assets])
  const [sorting, setSorting] = useState<SortingState>([{ id: 'symbol', desc: false }])
  const [selected, setSelected] = useState<RowSelectionState>(defaultSelected)
  const balances = useStore((s) => s.balances)
  const columns = useAssetTableColumns(props.isBorrow)
  const tableData: AssetTableRow[] = useMemo(() => {
    return props.assets.map((asset) => {
      const balancesForAsset = balances.find(byDenom(asset.denom))
      return {
        asset,
        balance: balancesForAsset?.amount ?? '0',
        market: markets.find((market) => market.denom === asset.denom),
      }
    })
  }, [balances, props.assets, markets])

  const table = useReactTable({
    data: tableData,
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
    const newSelectedDenoms = props.assets
      .filter((_, index) => selected[index])
      .map((asset) => asset.denom)

    if (
      props.selectedDenoms.length === newSelectedDenoms.length &&
      newSelectedDenoms.every((denom) => props.selectedDenoms.includes(denom))
    )
      return
    props.onChangeSelected(newSelectedDenoms)
  }, [selected, props])

  return (
    <table className='w-full'>
      <thead className='border-b border-white/5'>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={classNames(
                    'p-2',
                    header.column.getCanSort() && 'hover:cursor-pointer',
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
            <tr
              key={row.id}
              className='hover:cursor-pointer text-white/60'
              onClick={() => row.toggleSelected()}
            >
              {row.getVisibleCells().map((cell) => {
                return (
                  <td
                    key={cell.id}
                    className={classNames(
                      cell.column.id === 'select' ? `` : 'text-right',
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
