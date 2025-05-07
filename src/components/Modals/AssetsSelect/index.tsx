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
import { byDenom } from 'utils/array'

interface Props {
  assets: Asset[]
  onChangeSelected: (selected: string[]) => void
  selectedDenoms: string[]
  isBorrow?: boolean
  nonCollateralTableAssets?: Asset[]
  assetsSectionTitle?: string
  nonCollateralAssetsSectionTitle?: string
  account?: Account
  repayFromWallet?: boolean
}

export default function AssetsSelect(props: Props) {
  const {
    onChangeSelected,
    isBorrow,
    assets,
    nonCollateralTableAssets,
    selectedDenoms,
    assetsSectionTitle = 'Assets that can be used as collateral',
    nonCollateralAssetsSectionTitle = 'Non whitelisted assets, cannot be used as collateral',
    account,
    repayFromWallet,
  } = props
  const columns = useAssetSelectColumns(isBorrow)
  const markets = useMarkets()
  const whitelistedAssets = useWhitelistedAssets()
  const walletBalances = useStore((s) => s.balances)
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
        if (account && !repayFromWallet) {
          const depositBalance = account.deposits.find(byDenom(asset.denom))?.amount || BN(0)
          const lendBalance = account.lends.find(byDenom(asset.denom))?.amount || BN(0)
          const totalAmount = depositBalance.plus(lendBalance)

          const coin = BNCoin.fromDenomAndBigNumber(asset.denom, totalAmount)
          const value = getCoinValue(coin, assets)

          asset.campaigns = isBorrow ? [] : asset.campaigns
          return {
            asset,
            balance: totalAmount.toString(),
            value,
            market: markets.find((market) => market.asset.denom === asset.denom),
            chainName: asset.chainName || '',
          }
        } else {
          const balanceData = walletBalances.find(
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
        }
      })
    },
    [walletBalances, markets, isBorrow, account, repayFromWallet],
  )

  const tableData = useMemo(() => {
    if (nonCollateralTableAssets === undefined) {
      return createTableData(assets)
    }

    let filteredAssets = assets
    let filteredNonCollateralAssets = nonCollateralTableAssets

    if (account && !repayFromWallet) {
      filteredAssets = assets.filter((asset) => {
        const depositBalance = account.deposits.find(byDenom(asset.denom))?.amount || BN(0)
        const lendBalance = account.lends.find(byDenom(asset.denom))?.amount || BN(0)
        return depositBalance.plus(lendBalance).isGreaterThan(0)
      })

      filteredNonCollateralAssets = nonCollateralTableAssets.filter((asset) => {
        const depositBalance = account.deposits.find(byDenom(asset.denom))?.amount || BN(0)
        const lendBalance = account.lends.find(byDenom(asset.denom))?.amount || BN(0)
        return depositBalance.plus(lendBalance).isGreaterThan(0)
      })
    } else {
      const whitelistedTableData = filteredWhitelistedAsset.filter((asset) =>
        walletBalances.some((balance) => balance.denom === asset.denom && balance.amount !== '0'),
      )
      filteredAssets = whitelistedTableData
    }

    const whitelistedData = createTableData(filteredAssets)
    const nonCollateralData = createTableData(filteredNonCollateralAssets)

    return { whitelistedData, nonCollateralData }
  }, [
    assets,
    nonCollateralTableAssets,
    filteredWhitelistedAsset,
    walletBalances,
    createTableData,
    account,
    repayFromWallet,
  ])

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

      newSelectedDenoms = selectedAssets.map((asset) =>
        asset.chainName ? `${asset.denom}:${asset.chainName}` : asset.denom,
      )
    } else {
      const filteredWhitelistedAsset = assets.filter((asset, index) => whitelistedSelected[index])
      const nonCollateralAssets =
        nonCollateralTableAssets?.filter((_, index) => nonCollateralSelected[index]) || []

      const allSelectedAssets = [...filteredWhitelistedAsset, ...nonCollateralAssets]

      const debtAsset = allSelectedAssets.find((asset) => asset.denom === assets[0]?.denom)
      const swapAsset = allSelectedAssets.find((asset) => asset.denom !== assets[0]?.denom)

      const finalSelectedAssets = [debtAsset, swapAsset].filter(Boolean) as Asset[]

      newSelectedDenoms = finalSelectedAssets
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

  const handleNonCollateralSelection: (
    updaterOrValue: RowSelectionState | ((old: RowSelectionState) => RowSelectionState),
  ) => void = useCallback((updaterOrValue) => {
    let selectedIndex: string | undefined
    if (typeof updaterOrValue === 'function') {
      const result = updaterOrValue({})
      selectedIndex = Object.keys(result).find((key) => result[key])
    } else {
      selectedIndex = Object.keys(updaterOrValue).find((key) => updaterOrValue[key])
    }
    const newSelection: RowSelectionState = {}
    if (selectedIndex) {
      newSelection[selectedIndex] = true
    }
    setNonCollateralSelected(newSelection)
  }, [])

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
          title={assetsSectionTitle}
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
              {assetsSectionTitle}
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
          title={nonCollateralAssetsSectionTitle}
          columns={columns}
          data={createTableData(nonCollateralTableAssets)}
          initialSorting={sorting}
          onSortingChange={setSorting}
          setRowSelection={handleNonCollateralSelection}
          selectedRows={nonCollateralSelected}
          disableSortingRow
          hideCard
          titleComponent={
            <Text
              size='xs'
              className='p-4 font-semibold border-t border-b bg-black/20 text-white/60 border-white/10'
            >
              {nonCollateralAssetsSectionTitle}
            </Text>
          }
        />
      )}
    </>
  )
}
