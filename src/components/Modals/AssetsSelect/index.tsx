import { RowSelectionState, SortingState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Callout, CalloutType } from 'components/common/Callout'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useAssetSelectColumns from 'components/Modals/AssetsSelect/Columns/useAssetSelectColumns'
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
  assetsSectionTitle?: string
  nonCollateralAssetsSectionTitle?: string
  account?: Account
  repayFromWallet?: boolean
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
    assetsSectionTitle = 'Assets that can be used as collateral',
    nonCollateralAssetsSectionTitle = 'Non whitelisted assets, cannot be used as collateral',
    account,
    repayFromWallet,
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
  const walletBalances = useStore((s) => s.balances)

  const [sorting, setSorting] = useState<SortingState>([
    { id: isBorrow ? 'asset.borrowRate' : 'value', desc: !isBorrow },
  ])

  const defaultSelected = useMemo(() => {
    // Don't initialize here - let the effect handle it based on actual tableData
    return {}
  }, [])

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
      // Filter assets based on wallet balances, matching both denom and chainName
      filteredAssets = assets.filter((asset) =>
        walletBalances.some(
          (balance) =>
            balance.denom === asset.denom &&
            balance.chainName === asset.chainName &&
            balance.amount !== '0',
        ),
      )
    }

    const whitelistedData = createTableData(filteredAssets)
    const nonCollateralData = createTableData(filteredNonCollateralAssets)

    return { whitelistedData, nonCollateralData }
  }, [assets, nonCollateralTableAssets, walletBalances, createTableData, account, repayFromWallet])

  const [whitelistedSelected, setWhitelistedSelected] = useState<RowSelectionState>({})
  const [nonCollateralSelected, setNonCollateralSelected] = useState<RowSelectionState>({})

  // Track table data identity to detect when table structure changes (not just values)
  const tableDataIdentity = useMemo(() => {
    const data = Array.isArray(tableData) ? tableData : tableData.whitelistedData || []
    const nonCollateral = Array.isArray(tableData) ? [] : tableData.nonCollateralData || []
    return (
      data.map((row) => `${row.asset.denom}:${row.asset.chainName || ''}`).join(',') +
      '|' +
      nonCollateral.map((row) => `${row.asset.denom}:${row.asset.chainName || ''}`).join(',')
    )
  }, [tableData])

  const prevTableIdentityRef = useRef<string>('')

  // Sync selection from selectedDenoms only when table structure changes
  useEffect(() => {
    // Check if table structure changed (or initial mount)
    if (prevTableIdentityRef.current !== tableDataIdentity) {
      prevTableIdentityRef.current = tableDataIdentity

      // Initialize selection state based on selectedDenoms and current tableData
      if (Array.isArray(tableData)) {
        const selection: RowSelectionState = {}
        tableData.forEach((row, index) => {
          const assetIdentifier = row.asset.chainName
            ? `${row.asset.denom}:${row.asset.chainName}`
            : row.asset.denom
          if (selectedDenoms?.includes(assetIdentifier)) {
            selection[index] = true
          }
        })
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWhitelistedSelected(selection)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNonCollateralSelected({})
      } else {
        const whitelistedSelection: RowSelectionState = {}
        const nonCollateralSelection: RowSelectionState = {}

        tableData.whitelistedData?.forEach((row, index) => {
          const assetIdentifier = row.asset.chainName
            ? `${row.asset.denom}:${row.asset.chainName}`
            : row.asset.denom
          if (selectedDenoms?.includes(assetIdentifier)) {
            whitelistedSelection[index] = true
          }
        })

        tableData.nonCollateralData?.forEach((row, index) => {
          const assetIdentifier = row.asset.chainName
            ? `${row.asset.denom}:${row.asset.chainName}`
            : row.asset.denom
          if (selectedDenoms?.includes(assetIdentifier)) {
            nonCollateralSelection[index] = true
          }
        })

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWhitelistedSelected(whitelistedSelection)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNonCollateralSelected(nonCollateralSelection)
      }
    }
  }, [tableDataIdentity, tableData, selectedDenoms])

  // Notify parent when selection changes
  useEffect(() => {
    let selectedAssets: Asset[] = []

    if (Array.isArray(tableData)) {
      // Simple case: just get selected assets from the table
      selectedAssets = tableData
        .filter((_, idx) => whitelistedSelected[idx])
        .map((row) => row.asset)
    } else {
      // Two-table case: combine selections from both tables
      const whitelistedTableData = tableData.whitelistedData || []
      const nonCollateralTableData = tableData.nonCollateralData || []

      const selectedWhitelistedAssets = whitelistedTableData
        .filter((_, index) => whitelistedSelected[index])
        .map((row) => row.asset)

      const selectedNonCollateralAssets = nonCollateralTableData
        .filter((_, index) => nonCollateralSelected[index])
        .map((row) => row.asset)

      selectedAssets = [...selectedWhitelistedAssets, ...selectedNonCollateralAssets]
    }

    // Convert to denom strings with optional chain names
    const newSelectedDenoms = selectedAssets.map((asset) =>
      asset.chainName ? `${asset.denom}:${asset.chainName}` : asset.denom,
    )

    // Only call onChangeSelected if the selection actually changed to avoid infinite loops
    const hasChanged =
      selectedDenoms.length !== newSelectedDenoms.length ||
      !newSelectedDenoms.every((denom) => selectedDenoms.includes(denom))

    if (hasChanged) {
      onChangeSelected(newSelectedDenoms)
    }
  }, [whitelistedSelected, nonCollateralSelected, tableData, onChangeSelected, selectedDenoms])

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

  const whitelistedData = !Array.isArray(tableData) ? tableData.whitelistedData : []
  const nonCollateralData = !Array.isArray(tableData) ? tableData.nonCollateralData : []

  return (
    <>
      {(nonCollateralData.length > 0 || whitelistedData.length > 0) && (
        <Table
          title={assetsSectionTitle}
          columns={columns}
          data={whitelistedData}
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

      {nonCollateralData.length === 0 && whitelistedData.length === 0 && (
        <Callout type={CalloutType.INFO} className='mx-4 mt-4 text-white/60'>
          No assets that match your search.
        </Callout>
      )}

      {nonCollateralData.length > 0 && whitelistedData.length === 0 && (
        <Callout type={CalloutType.INFO} className='m-4 text-white/60'>
          No whitelisted assets found in your wallet.
        </Callout>
      )}

      {nonCollateralData.length > 0 && (
        <Table
          title={nonCollateralAssetsSectionTitle}
          columns={columns}
          data={nonCollateralData}
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
