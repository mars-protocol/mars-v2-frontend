import { RowSelectionState, SortingState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Callout, CalloutType } from 'components/common/Callout'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useAssetSelectColumns from 'components/Modals/AssetsSelect/Columns/useAssetSelectColumns'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useMarkets from 'hooks/markets/useMarkets'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  assets: Asset[]
  onChangeSelected: (selected: string[]) => void
  selectedDenoms: string[]
  isBorrow?: boolean
  nonCollateralTableAssets?: Asset[]
  hideColumns?: string[]
  hideApy?: boolean
}

export default function AssetsSelect(props: Props) {
  const {
    onChangeSelected,
    isBorrow,
    assets,
    nonCollateralTableAssets,
    selectedDenoms,
    hideColumns,
    hideApy,
  } = props
  const columns = useAssetSelectColumns(isBorrow, hideApy)

  const filteredColumns = useMemo(() => {
    if (!hideColumns || hideColumns.length === 0) return columns

    return columns.filter((column) => {
      if (!column.id) return true
      return !hideColumns.includes(column.id)
    })
  }, [columns, hideColumns])

  const markets = useMarkets()
  const whitelistedAssets = useWhitelistedAssets()
  const balances = useStore((s) => s.balances)
  const filteredWhitelistedAsset = useMemo(
    () => whitelistedAssets.filter((asset) => !asset.isDeprecated),
    [whitelistedAssets],
  )

  const [sorting, setSorting] = useState<SortingState>([
    { id: isBorrow ? 'asset.borrowRate' : 'value', desc: !isBorrow },
  ])

  const createTableData = useCallback(
    (assets: Asset[]): AssetTableRow[] => {
      return assets.map((asset) => {
        const balancesForAsset = balances.find(byDenom(asset.denom))
        const coin = BNCoin.fromDenomAndBigNumber(asset.denom, BN(balancesForAsset?.amount ?? '0'))
        const value = getCoinValue(coin, assets)
        asset.campaigns = isBorrow ? [] : asset.campaigns
        return {
          asset,
          balance: balancesForAsset?.amount ?? '0',
          value,
          market: markets.find((market) => market.asset.denom === asset.denom),
        }
      })
    },
    [balances, markets, isBorrow],
  )

  const tableData = useMemo(() => {
    if (nonCollateralTableAssets === undefined) {
      return createTableData(assets)
    }

    const whitelistedTableData = filteredWhitelistedAsset.filter((asset) =>
      balances.some((balance) => balance.denom === asset.denom && balance.amount !== '0'),
    )
    const whitelistedData = createTableData(whitelistedTableData)
    const nonCollateralData = createTableData(nonCollateralTableAssets)

    return { whitelistedData, nonCollateralData }
  }, [assets, nonCollateralTableAssets, filteredWhitelistedAsset, balances, createTableData])

  const [initialSelected, initialNonCollateralSelected] = useMemo(() => {
    const selectionState = (
      selectedDenoms: string[],
      tableData: AssetTableRow[],
    ): RowSelectionState => {
      const selectionState = {} as RowSelectionState
      tableData.forEach((row, index) => {
        selectionState[index.toString()] = !!selectedDenoms.includes(row.asset.denom)
      })
      return selectionState
    }

    return [
      selectionState(
        selectedDenoms,
        isAssetTableRowArray(tableData) ? tableData : tableData.whitelistedData,
      ),
      selectionState(
        selectedDenoms,
        isAssetTableRowArray(tableData) ? [] : tableData.nonCollateralData,
      ),
    ]
  }, [selectedDenoms, tableData])

  const [whitelistedSelected, setWhitelistedSelected] = useState<RowSelectionState>(initialSelected)
  const [nonCollateralSelected, setNonCollateralSelected] = useState<RowSelectionState>(
    initialNonCollateralSelected,
  )

  useEffect(() => {
    let newSelectedDenoms: string[]

    if (Array.isArray(tableData)) {
      newSelectedDenoms = assets
        .filter((asset) =>
          tableData.some((row, idx) => row.asset.denom === asset.denom && whitelistedSelected[idx]),
        )
        .map((asset) => asset.denom)
    } else {
      const filteredWhitelistedAsset = assets.filter((asset) =>
        tableData.whitelistedData.some(
          (row, index) => row.asset.denom === asset.denom && whitelistedSelected[index],
        ),
      )
      const nonCollateralAssets =
        nonCollateralTableAssets?.filter((asset) =>
          tableData.nonCollateralData.some(
            (row, index) => row.asset.denom === asset.denom && nonCollateralSelected[index],
          ),
        ) || []

      newSelectedDenoms = [...filteredWhitelistedAsset, ...nonCollateralAssets]
        .sort((a, b) => a.symbol.localeCompare(b.symbol))
        .map((asset) => asset.denom)
    }
    if (
      selectedDenoms.length === newSelectedDenoms.length &&
      newSelectedDenoms.every((denom) => selectedDenoms.includes(denom))
    )
      return
    onChangeSelected(newSelectedDenoms)
  }, [
    whitelistedSelected,
    nonCollateralSelected,
    tableData,
    selectedDenoms,
    onChangeSelected,
    assets,
    nonCollateralTableAssets,
  ])

  if (!nonCollateralTableAssets) {
    return (
      <Table
        title='Assets'
        columns={filteredColumns}
        data={tableData as AssetTableRow[]}
        initialSorting={sorting}
        onSortingChange={setSorting}
        setRowSelection={setWhitelistedSelected}
        selectedRows={whitelistedSelected}
        hideCard
      />
    )
  }

  return (
    <>
      {(nonCollateralTableAssets.length > 0 || assets.length > 0) && (
        <Table
          title='Assets that can be used as collateral'
          columns={columns}
          data={createTableData(assets)}
          initialSorting={sorting}
          onSortingChange={setSorting}
          setRowSelection={setWhitelistedSelected}
          selectedRows={whitelistedSelected}
          hideCard
          titleComponent={
            <Text
              size='xs'
              className='p-4 font-semibold border-b bg-black/20 text-white/60 border-white/10'
            >
              Assets that can be used as collateral
            </Text>
          }
        />
      )}

      {nonCollateralTableAssets.length === 0 && assets.length === 0 && (
        <Callout type={CalloutType.INFO} className='mx-4 mt-4 text-white/60'>
          No assets that match your search.
        </Callout>
      )}

      {nonCollateralTableAssets.length > 0 && assets.length === 0 && (
        <Callout type={CalloutType.INFO} className='m-4 text-white/60'>
          No whitelisted assets found in your wallet.
        </Callout>
      )}

      {nonCollateralTableAssets.length > 0 && (
        <Table
          title='Non whitelisted assets, cannot be used as collateral'
          columns={columns}
          data={createTableData(nonCollateralTableAssets)}
          initialSorting={sorting}
          onSortingChange={setSorting}
          setRowSelection={setNonCollateralSelected}
          selectedRows={nonCollateralSelected}
          disableSortingRow
          hideCard
          titleComponent={
            <Text
              size='xs'
              className='p-4 font-semibold border-t border-b bg-black/20 text-white/60 border-white/10'
            >
              Non whitelisted assets, cannot be used as collateral
            </Text>
          }
        />
      )}
    </>
  )
}

function isAssetTableRowArray(
  tableData:
    | AssetTableRow[]
    | { whitelistedData: AssetTableRow[]; nonCollateralData: AssetTableRow[] },
): tableData is AssetTableRow[] {
  return !('whitelistedData' in tableData)
}
