import { RowSelectionState, SortingState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Table from 'components/common/Table'
import useSingleAssetSelectColumns from 'components/Modals/AssetsSelect/Columns/useSingleAssetSelectColumns'
import { BN_ZERO } from 'constants/math'
import useMarkets from 'hooks/markets/useMarkets'
import { BNCoin } from 'types/classes/BNCoin'
import { getCoinValue } from 'utils/formatters'

interface Props {
  assets: Asset[]
  onChangeSelected: (selected: string) => void
  selectedDenom: string
}

export default function SingleAssetsSelect(props: Props) {
  const { onChangeSelected, assets, selectedDenom } = props
  const columns = useSingleAssetSelectColumns()
  const markets = useMarkets()

  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: true }])

  const createTableData = useCallback(
    (assets: Asset[]): AssetTableRow[] => {
      return assets.map((asset) => {
        const coin = BNCoin.fromDenomAndBigNumber(asset.denom, BN_ZERO)
        const value = getCoinValue(coin, assets)
        return {
          asset,
          balance: '0',
          value,
          market: markets.find((market) => market.asset.denom === asset.denom),
        }
      })
    },
    [markets],
  )

  const tableData = useMemo(() => {
    return createTableData(assets)
  }, [assets, createTableData])

  const initialSelected = useMemo(() => {
    const selectionState = (tableData: AssetTableRow[]): RowSelectionState => {
      const selectionState = {} as RowSelectionState
      tableData.forEach((row, index) => {
        selectionState[index.toString()] = false
      })
      return selectionState
    }

    return selectionState(tableData)
  }, [tableData])

  const [selected, setSelected] = useState<RowSelectionState>(initialSelected)

  useEffect(() => {
    let newSelectedDenom: string = ''

    if (Array.isArray(tableData)) {
      newSelectedDenom = assets
        .filter((asset) =>
          tableData.some((row, idx) => row.asset.denom === asset.denom && selected[idx]),
        )
        .map((asset) => asset.denom)[0]
    }
    if (newSelectedDenom === '') return
    onChangeSelected(newSelectedDenom)
  }, [selected, tableData, assets, selectedDenom, onChangeSelected])

  return (
    <Table
      title='Assets'
      columns={columns}
      data={tableData as AssetTableRow[]}
      initialSorting={sorting}
      onSortingChange={setSorting}
      setRowSelection={setSelected}
      selectedRows={selected}
      hideCard
    />
  )
}
