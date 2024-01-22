import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import Asset, { ASSET_META } from 'components/account/AccountPerpPositionTable/Columns/Asset'
import LiqPrice, { LIQ_META } from 'components/account/AccountPerpPositionTable/Columns/LiqPrice'
import TotalPnL, { PNL_META } from 'components/account/AccountPerpPositionTable/Columns/TotalPnL'
import Value, {
  VALUE_META,
  valueSortingFn,
} from 'components/account/AccountPerpPositionTable/Columns/Value'
import useHealthComputer from 'hooks/useHealthComputer'
import useStore from 'store'

export default function useAccountPerpsColumns(account: Account, showLiquidationPrice?: boolean) {
  const updatedAccount = useStore((s) => s.updatedAccount)

  const { computeLiquidationPrice } = useHealthComputer(updatedAccount ?? account)

  return useMemo<ColumnDef<AccountPerpRow>[]>(() => {
    return [
      {
        ...ASSET_META,
        cell: ({ row }) => (
          <Asset tradeDirection={row.original.tradeDirection} symbol={row.original.symbol} />
        ),
      },
      {
        ...VALUE_META,
        cell: ({ row }) => (
          <Value sizeChange={row.original.sizeChange} value={row.original.value} type='perp' />
        ),
        sortingFn: valueSortingFn,
      },
      {
        ...LIQ_META,
        enableSorting: false,
        cell: ({ row }: { row: Row<AccountPerpRow> }) => (
          <LiqPrice
            denom={row.original.denom}
            computeLiquidationPrice={computeLiquidationPrice}
            account={updatedAccount ?? account}
          />
        ),
      },
      {
        ...PNL_META,
        cell: ({ row }) => <TotalPnL pnl={row.original.pnl} />,
      },
    ]
  }, [computeLiquidationPrice, account, updatedAccount])
}
