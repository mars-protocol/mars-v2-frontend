import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import TransactionHash from 'components/portfolio/Liquidations/Cell/TransactionHash'
import LiquidatedAsset from 'components/portfolio/Liquidations/Cell/LiquidatedAsset'
import LiquidationPrice from 'components/portfolio/Liquidations/Cell/LiquidationPrice'
import Timestamp from 'components/common/Timestamp'
import useAssets from 'hooks/assets/useAssets'
import Text from 'components/common/Text'

export default function useLiquidationsColumns() {
  const { data: assetsData } = useAssets()

  return useMemo<ColumnDef<LiquidationDataItem>[]>(() => {
    return [
      {
        header: 'Time',
        meta: { className: 'min-w-20' },
        cell: ({ row }: { row: Row<LiquidationDataItem> }) => (
          <Timestamp
            value={row.original.timestamp as string}
            unit='milliseconds'
            showUtc={true}
            use24Hour={true}
          />
        ),
      },
      {
        header: 'Account ID',
        cell: ({ row }: { row: Row<LiquidationDataItem> }) => (
          <Text size='sm'>#{row.original.liquidatee_account_id}</Text>
        ),
      },
      {
        header: 'Liquidated Collateral',
        cell: ({ row }: { row: Row<LiquidationDataItem> }) => (
          <LiquidatedAsset
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
          <TransactionHash txHash={row.original.tx_hash as string} />
        ),
      },
    ]
  }, [assetsData])
}
