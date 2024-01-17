import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames'
import { useEffect, useMemo, useState } from 'react'

import Text from 'components/common/Text'
import useAssetTableColumns from 'components/Modals/AssetsSelect/useAssetTableColumns'
import { BN_ZERO } from 'constants/math'
import useGetCoinValue from 'hooks/assets/useGetCoinValue'
import useMarketAssets from 'hooks/markets/useMarketAssets'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

interface Props {
  assets: Asset[] | BorrowAsset[]
  selectedDenoms: string[]
  onChangeSelected: (denoms: string[]) => void
  isBorrow: boolean
}

export default function AssetSelectTable(props: Props) {
  const { data: markets } = useMarketAssets()
  const getCoinValue = useGetCoinValue()
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
  const [selected, setSelected] = useState<RowSelectionState>(defaultSelected)
  const balances = useStore((s) => s.balances)
  const columns = useAssetTableColumns(props.isBorrow)
  const tableData: AssetTableRow[] = useMemo(() => {
    return props.assets.map((asset) => {
      const balancesForAsset = balances.find(byDenom(asset.denom))
      const coin = BNCoin.fromDenomAndBigNumber(asset.denom, BN(balancesForAsset?.amount ?? '0'))
      const value = getCoinValue(coin)
      return {
        asset,
        balance: balancesForAsset?.amount ?? '0',
        value,
        market: markets.find((market) => market.denom === asset.denom),
      }
    })
  }, [balances, props.assets, markets])

  const table = useReactTable({
    data: tableData.sort((a, b) => {
      const valueA = a?.value ?? BN_ZERO
      const valueB = b?.value ?? BN_ZERO
      return valueA.gt(valueB) ? -1 : 1
    }),
    columns,
    state: {
      rowSelection: selected,
    },
    onRowSelectionChange: setSelected,
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
      <thead className='border-b border-white/10'>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <th
                  key={header.id}
                  className={classNames(
                    'p-2 pl-4',
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
