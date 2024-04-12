import { RowSelectionState } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'

import useAssetSelectColumns from 'components/Modals/AssetsSelect/Columns/useAssetSelectColumns'
import Table from 'components/common/Table'
import useGetCoinValue from 'hooks/assets/useGetCoinValue'
import useMarkets from 'hooks/markets/useMarkets'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

// TODO: Pass the market data directly here instead of the assets
interface Props {
  assets: Asset[]
  onChangeSelected: (selected: string[]) => void
  selectedDenoms: string[]
  isBorrow?: boolean
}

export default function AssetsSelect(props: Props) {
  const { assets, onChangeSelected, selectedDenoms, isBorrow } = props
  const columns = useAssetSelectColumns(isBorrow)
  const markets = useMarkets()
  const getCoinValue = useGetCoinValue()

  const defaultSelected = useMemo(() => {
    return assets.reduce(
      (acc, asset, index) => {
        if (selectedDenoms?.includes(asset.denom)) {
          acc[index] = true
        }
        return acc
      },
      {} as { [key: number]: boolean },
    )
  }, [selectedDenoms, assets])

  const [selected, setSelected] = useState<RowSelectionState>(defaultSelected)

  const balances = useStore((s) => s.balances)
  const tableData: AssetTableRow[] = useMemo(() => {
    return assets.map((asset) => {
      const balancesForAsset = balances.find(byDenom(asset.denom))
      const coin = BNCoin.fromDenomAndBigNumber(asset.denom, BN(balancesForAsset?.amount ?? '0'))
      const value = getCoinValue(coin)
      return {
        asset,
        balance: balancesForAsset?.amount ?? '0',
        value,
        market: markets.find((market) => market.asset.denom === asset.denom),
      }
    })
  }, [balances, assets, markets, getCoinValue])

  useEffect(() => {
    const selectedAssets = assets.filter((_, index) => selected[index])

    const newSelectedDenoms = selectedAssets
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
      .map((asset) => asset.denom)
    if (
      selectedDenoms.length === newSelectedDenoms.length &&
      newSelectedDenoms.every((denom) => selectedDenoms.includes(denom))
    )
      return
    onChangeSelected(newSelectedDenoms)
  }, [selected, props, assets, selectedDenoms, onChangeSelected])

  return (
    <Table
      title='Assets'
      hideCard={true}
      columns={columns}
      data={tableData}
      initialSorting={[{ id: isBorrow ? 'asset.borrowRate' : 'value', desc: !isBorrow }]}
      setRowSelection={setSelected}
      selectedRows={selected}
    />
  )
}
