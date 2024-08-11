import { RowSelectionState } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'

import useAssetSelectColumns from 'components/Modals/AssetsSelect/Columns/useAssetSelectColumns'
import Table from 'components/common/Table'
import useMarkets from 'hooks/markets/useMarkets'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

// TODO: Pass the market data directly here instead of the assets
interface Props {
  assets: Asset[]
  onChangeSelected: (selected: string[]) => void
  selectedDenoms: string[]
  isBorrow?: boolean
  showChainColumn?: boolean
}

export default function AssetsSelect(props: Props) {
  const { assets, onChangeSelected, selectedDenoms, isBorrow } = props
  const columns = useAssetSelectColumns(isBorrow)
  const markets = useMarkets()

  const defaultSelected = useMemo(() => {
    return assets.reduce(
      (acc, asset, index) => {
        if (selectedDenoms?.includes(`${asset.denom}:${asset.chainName}`)) {
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
      const balanceData = balances.find(
        (balance) => balance.denom === asset.denom && balance.chainName === asset.chainName,
      ) || { amount: '0', chainName: '' }

      const balanceAmount = balanceData.amount
      const coin = BNCoin.fromDenomAndBigNumber(asset.denom, BN(balanceAmount))
      const value = getCoinValue(coin, assets)
      asset.campaign = isBorrow ? undefined : asset.campaign
      return {
        asset,
        balance: balanceAmount,
        value,
        market: markets.find((market) => market.asset.denom === asset.denom),
        chainName: balanceData.chainName || '',
      }
    })
  }, [assets, balances, isBorrow, markets])

  useEffect(() => {
    const selectedAssets = assets.filter((_, index) => selected[index])

    const newSelectedDenoms = selectedAssets
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
      .map((asset) => `${asset.denom}:${asset.chainName}`)

    if (
      selectedDenoms.length === newSelectedDenoms.length &&
      newSelectedDenoms.every((denom) => selectedDenoms.includes(denom))
    )
      return
    onChangeSelected(newSelectedDenoms)
  }, [selected, assets, selectedDenoms, onChangeSelected])

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
