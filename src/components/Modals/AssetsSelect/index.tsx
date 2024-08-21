import { RowSelectionState, SortingState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'

import useAssetSelectColumns from 'components/Modals/AssetsSelect/Columns/useAssetSelectColumns'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useMarkets from 'hooks/markets/useMarkets'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { Callout, CalloutType } from 'components/common/Callout'

interface Props {
  assets: Asset[]
  onChangeSelected: (selected: string[]) => void
  selectedDenoms: string[]
  isBorrow?: boolean
  nonCollateralTableAssets?: Asset[]
}

export default function AssetsSelect({
  onChangeSelected,
  selectedDenoms,
  isBorrow,
  assets,
  nonCollateralTableAssets,
}: Props) {
  const columns = useAssetSelectColumns(isBorrow)
  const markets = useMarkets()
  const whitelistedAssets = useWhitelistedAssets()
  const balances = useStore((s) => s.balances)

  const [sorting, setSorting] = useState<SortingState>([
    { id: isBorrow ? 'asset.borrowRate' : 'value', desc: !isBorrow },
  ])

  const createTableData = useCallback(
    (assets: Asset[]): AssetTableRow[] => {
      return assets.map((asset) => {
        const balanceData = balances.find(
          (balance) => balance.denom === asset.denom && balance.chainName === asset.chainName,
        ) || { amount: '0', chainName: '' }
        const coin = BNCoin.fromDenomAndBigNumber(asset.denom, BN(balanceData.amount))
        const value = getCoinValue(coin, assets)
        asset.campaign = isBorrow ? undefined : asset.campaign
        return {
          asset,
          balance: balanceData.amount,
          value,
          market: markets.find((market) => market.asset.denom === asset.denom),
          chainName: balanceData.chainName || '',
        }
      })
    },
    [balances, markets, isBorrow],
  )

  const tableData = useMemo(() => {
    if (nonCollateralTableAssets === undefined) {
      return createTableData(assets)
    }

    const whitelistedTableData = whitelistedAssets.filter((asset) =>
      balances.some((balance) => balance.denom === asset.denom && balance.amount !== '0'),
    )
    const whitelistedData = createTableData(whitelistedTableData)
    const nonCollateralData = createTableData(nonCollateralTableAssets)

    return { whitelistedData, nonCollateralData }
  }, [assets, nonCollateralTableAssets, whitelistedAssets, balances, createTableData])

  const [whitelistedSelected, setWhitelistedSelected] = useState<RowSelectionState>({})
  const [nonCollateralSelected, setNonCollateralSelected] = useState<RowSelectionState>({})

  useEffect(() => {
    let newSelectedDenoms: string[]

    if (Array.isArray(tableData)) {
      newSelectedDenoms = assets
        .filter((asset, index) =>
          tableData.some((row, idx) => row.asset.denom === asset.denom && whitelistedSelected[idx]),
        )
        .map((asset) => `${asset.denom}:${asset.chainName}`)
    } else {
      const whitelistedAssets = assets.filter((asset) =>
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

      newSelectedDenoms = [...whitelistedAssets, ...nonCollateralAssets]
        .sort((a, b) => a.symbol.localeCompare(b.symbol))
        .map((asset) => `${asset.denom}:${asset.chainName}`)
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
        columns={columns}
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
          <div className=''>
            <Text
              size='xs'
              className='p-4 font-semibold bg-black/20 text-white/60 border-b border-white/10 w-full'
            >
              Assets that can be used as collateral
            </Text>
          </div>
        }
      />
      {nonCollateralTableAssets.length > 0 && assets.length === 0 && (
        <Callout type={CalloutType.INFO} className='px-4 py-2 text-white/60 m-4'>
          No whitelisted assets found in your wallet.
        </Callout>
      )}
      {nonCollateralTableAssets.length > 0 && (
        <>
          <Text
            size='xs'
            className='p-4 font-semibold bg-black/20 text-white/60 border-t border-b border-white/10'
          >
            Non whitelisted assets, cannot be used as collateral
          </Text>
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
          />
        </>
      )}
    </>
  )
}
