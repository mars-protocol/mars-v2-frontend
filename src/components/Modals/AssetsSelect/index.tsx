import { RowSelectionState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'

import useAssetSelectColumns from 'components/Modals/AssetsSelect/Columns/useAssetSelectColumns'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useMarkets from 'hooks/markets/useMarkets'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'
import useChainConfig from 'hooks/chain/useChainConfig'
import { Callout, CalloutType } from 'components/common/Callout'

// TODO: Pass the market data directly here instead of the assets
interface Props {
  assets: Asset[]
  onChangeSelected: (selected: string[]) => void
  selectedDenoms: string[]
  isBorrow?: boolean
}

export default function AssetsSelect(props: Props) {
  const { onChangeSelected, selectedDenoms, isBorrow, assets } = props
  const columns = useAssetSelectColumns(isBorrow)
  const markets = useMarkets()
  const chainConfig = useChainConfig()

  const whitelistedAssets = useWhitelistedAssets()
  const depositEnabledAssets = useDepositEnabledAssets()

  const balances = useStore((s) => s.balances)

  const createTableData = useCallback(
    (assets: Asset[]): AssetTableRow[] => {
      return assets.map((asset) => {
        const balancesForAsset = balances.find(byDenom(asset.denom))
        const coin = BNCoin.fromDenomAndBigNumber(asset.denom, BN(balancesForAsset?.amount ?? '0'))
        const value = getCoinValue(coin, assets)
        asset.campaign = isBorrow ? undefined : asset.campaign
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

  const whitelistedTableData = useMemo(() => {
    const userWhitelistedAssets = whitelistedAssets.filter((asset) =>
      balances.some((balance) => balance.denom === asset.denom && balance.amount !== '0'),
    )
    const data = createTableData(userWhitelistedAssets)
    return data
  }, [whitelistedAssets, balances, createTableData])

  const depositEnabledTableData = useMemo(() => {
    const userDepositEnabledAssets = depositEnabledAssets.filter(
      (asset) =>
        !asset.isWhitelisted &&
        balances.some((balance) => balance.denom === asset.denom && balance.amount !== '0'),
    )
    const data = createTableData(userDepositEnabledAssets)
    return data
  }, [depositEnabledAssets, balances, createTableData])

  const defaultSelected = useMemo(() => {
    return [...whitelistedTableData, ...depositEnabledTableData].reduce(
      (acc, row, index) => {
        if (selectedDenoms?.includes(row.asset.denom)) {
          acc[index] = true
        }
        return acc
      },
      {} as { [key: number]: boolean },
    )
  }, [selectedDenoms, whitelistedTableData, depositEnabledTableData])

  const [selected, setSelected] = useState<RowSelectionState>(defaultSelected)

  useEffect(() => {
    const selectedAssets = assets.filter((asset) =>
      [...whitelistedTableData, ...depositEnabledTableData].some(
        (row, index) => row.asset.denom === asset.denom && selected[index],
      ),
    )

    const newSelectedDenoms = selectedAssets
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
      .map((asset) => asset.denom)
    if (
      selectedDenoms.length === newSelectedDenoms.length &&
      newSelectedDenoms.every((denom) => selectedDenoms.includes(denom))
    )
      return
    onChangeSelected(newSelectedDenoms)
  }, [
    selected,
    whitelistedTableData,
    depositEnabledTableData,
    selectedDenoms,
    onChangeSelected,
    assets,
  ])

  const showNonWhitelisted = chainConfig.anyAsset && depositEnabledTableData.length > 0

  return (
    <>
      {showNonWhitelisted && (
        <Text size='sm' className='px-4 py-2 font-semibold bg-black/20 text-white/60'>
          Assets that can be used as collateral
        </Text>
      )}
      {whitelistedTableData.length > 0 ? (
        <Table
          title='Assets that can be used as collateral'
          columns={columns}
          data={whitelistedTableData}
          initialSorting={[{ id: isBorrow ? 'asset.borrowRate' : 'value', desc: !isBorrow }]}
          setRowSelection={setSelected}
          selectedRows={selected}
          hideCard
        />
      ) : (
        <Callout type={CalloutType.INFO} className='px-4 py-2 text-white/60 m-4'>
          No whitelisted assets found in your wallet.
        </Callout>
      )}
      {showNonWhitelisted && (
        <>
          <Text
            size='sm'
            className={`px-4 py-2 ${whitelistedTableData.length > 0 ? 'mt-4' : ''} font-semibold bg-black/20 text-white/60`}
          >
            Non whitelisted assets, cannot be used as collateral
          </Text>
          <Table
            title='Non whitelisted assets, cannot be used as collateral'
            columns={columns}
            data={depositEnabledTableData}
            initialSorting={[{ id: isBorrow ? 'asset.borrowRate' : 'value', desc: !isBorrow }]}
            setRowSelection={setSelected}
            selectedRows={selected}
            hideCard
          />
        </>
      )}
    </>
  )
}
