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
import { getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  assets: Asset[]
  onChangeSelected: (selected: string[]) => void
  selectedDenoms: string[]
  isBorrow?: boolean
  nonCollateralTableAssets?: Asset[]
}

export default function AssetsSelect(props: Props) {
  const { onChangeSelected, isBorrow, assets, nonCollateralTableAssets, selectedDenoms } = props
  const columns = useAssetSelectColumns(isBorrow)
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

  const defaultSelected = useMemo(() => {
    return assets.reduce(
      (acc, asset, index) => {
        const assetIdentifier = asset.chainName ? `${asset.denom}:${asset.chainName}` : asset.denom

        if (selectedDenoms?.includes(assetIdentifier)) {
          acc[index] = true
        }
        return acc
      },
      {} as { [key: number]: boolean },
    )
  }, [selectedDenoms, assets])

  const createTableData = useCallback(
    (assets: Asset[]): AssetTableRow[] => {
      return assets.map((asset) => {
        const balanceData = balances.find(
          (balance) => balance.denom === asset.denom && balance.chainName === asset.chainName,
        ) || { amount: '0', chainName: '' }
        const coin = BNCoin.fromDenomAndBigNumber(asset.denom, BN(balanceData.amount))
        const value = getCoinValue(coin, assets)
        asset.campaigns = isBorrow ? [] : asset.campaigns
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

    const whitelistedTableData = filteredWhitelistedAsset.filter((asset) =>
      balances.some((balance) => balance.denom === asset.denom && balance.amount !== '0'),
    )
    const whitelistedData = createTableData(whitelistedTableData)
    const nonCollateralData = createTableData(nonCollateralTableAssets)

    return { whitelistedData, nonCollateralData }
  }, [assets, nonCollateralTableAssets, filteredWhitelistedAsset, balances, createTableData])

  const [whitelistedSelected, setWhitelistedSelected] = useState<RowSelectionState>(defaultSelected)
  const [nonCollateralSelected, setNonCollateralSelected] = useState<RowSelectionState>(
    nonCollateralTableAssets?.reduce((acc, _, index) => {
      const assetIdentifier = nonCollateralTableAssets[index].chainName
        ? `${nonCollateralTableAssets[index].denom}:${nonCollateralTableAssets[index].chainName}`
        : nonCollateralTableAssets[index].denom

      acc[index] = selectedDenoms?.includes(assetIdentifier) || false
      return acc
    }, {} as RowSelectionState) ?? {},
  )

  useEffect(() => {
    let newSelectedDenoms: string[]

    if (Array.isArray(tableData)) {
      const selectedAssets = assets.filter((asset, idx) => whitelistedSelected[idx])
      console.log(
        'Single Table - Selected Assets:',
        selectedAssets.map((asset) => ({
          symbol: asset.symbol,
          denom: asset.denom,
          chainName: asset.chainName,
        })),
      )
      newSelectedDenoms = selectedAssets.map((asset) =>
        asset.chainName ? `${asset.denom}:${asset.chainName}` : asset.denom,
      )
    } else {
      const filteredWhitelistedAsset = assets.filter((asset, index) => whitelistedSelected[index])
      const nonCollateralAssets =
        nonCollateralTableAssets?.filter((_, index) => nonCollateralSelected[index]) || []

      // Get all selected assets from both tables
      const allSelectedAssets = [...filteredWhitelistedAsset, ...nonCollateralAssets]
      console.log(
        'Current Selected Assets:',
        allSelectedAssets.map((asset) => ({
          symbol: asset.symbol,
          denom: asset.denom,
          chainName: asset.chainName,
          isWhitelisted: filteredWhitelistedAsset.includes(asset),
        })),
      )

      const selectedEvmAssets = allSelectedAssets.filter((asset) => asset.chainName)
      if (selectedEvmAssets.length > 1) {
        console.warn(
          'Multiple EVM assets selected - this should not happen due to row-level control',
        )
      }

      newSelectedDenoms = allSelectedAssets
        .sort((a, b) => a.symbol.localeCompare(b.symbol))
        .map((asset) => (asset.chainName ? `${asset.denom}:${asset.chainName}` : asset.denom))
    }

    if (
      selectedDenoms.length === newSelectedDenoms.length &&
      newSelectedDenoms.every((denom) => selectedDenoms.includes(denom))
    ) {
      return
    }

    onChangeSelected(newSelectedDenoms)
  }, [
    whitelistedSelected,
    nonCollateralSelected,
    tableData,
    assets,
    selectedDenoms,
    onChangeSelected,
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
