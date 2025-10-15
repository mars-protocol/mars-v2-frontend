import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import Transaction from 'components/portfolio/Liquidations/Cell/Transaction'
import Asset from 'components/portfolio/Liquidations/Cell/Asset'
import LiquidationPrice from 'components/portfolio/Liquidations/Cell/LiquidationPrice'
import Account from 'components/portfolio/Liquidations/Cell/Account'
import Timestamp from 'components/portfolio/Liquidations/Cell/Timestamp'
import useAssets from 'hooks/assets/useAssets'

interface Props {
  isLoading: boolean
  showPosition?: boolean
}

export default function useLiquidationsColumns() {
  const { data: assetsData, isLoading: isAssetsLoading } = useAssets()

  return useMemo<ColumnDef<LiquidationDataItem>[]>(() => {
    return [
      {
        header: 'Time',
        meta: { className: 'min-w-20' },
        cell: ({ row }: { row: Row<LiquidationDataItem> }) => (
          <Timestamp value={row.original.timestamp as string} />
        ),
      },
      {
        header: 'Account ID',
        cell: ({ row }: { row: Row<LiquidationDataItem> }) => (
          <Account value={row.original.liquidatee_account_id as string} />
        ),
      },
      {
        header: 'Liquidated Collateral',
        cell: ({ row }: { row: Row<LiquidationDataItem> }) => (
          <Asset
            value={row.original.collateral_asset_won as BNCoin}
            assetData={assetsData}
            priceAtLiquidation={row.original.price_liquidated}
          />
        ),
      },
      {
        header: 'Liquidation Price',
        cell: ({ row }: { row: Row<LiquidationDataItem> }) => (
          <LiquidationPrice value={row.original} />
        ),
      },
      {
        header: 'Transaction',
        cell: ({ row }: { row: Row<LiquidationDataItem> }) => (
          <Transaction value={row.original.tx_hash as string} />
        ),
      },
    ]
  }, [assetsData])
}
