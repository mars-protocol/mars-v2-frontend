import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import LiqPrice, { LIQ_META } from 'components/account/AccountBalancesTable/Columns/LiqPrice'
import Value, {
  VALUE_META,
  valuePerpSortingFn,
} from 'components/account/AccountBalancesTable/Columns/Value'
import Asset, { ASSET_META } from 'components/account/AccountPerpPositionTable/Columns/Asset'
import TotalPnL, { PNL_META } from 'components/account/AccountPerpPositionTable/Columns/TotalPnL'
import useHealthComputer from 'hooks/useHealthComputer'
import useStore from 'store'

export default function useAccountPerpsColumns(account: Account, showLiquidationPrice?: boolean) {
  const updatedAccount = useStore((s) => s.updatedAccount)

  const { computeLiquidationPrice } = useHealthComputer(updatedAccount ?? account)

  return useMemo<ColumnDef<AccountPerpRow>[]>(() => {
    return [
      {
        ...ASSET_META,
        cell: ({ row }) => <Asset row={row.original} />,
      },
      {
        ...VALUE_META,
        cell: ({ row }) => (
          <Value amountChange={row.original.amountChange} value={row.original.value} type='perp' />
        ),
        sortingFn: valuePerpSortingFn,
      },
      {
        ...LIQ_META,
        header: 'Liq. Price',
        enableSorting: false,
        cell: ({ row }) => (
          <LiqPrice
            denom={row.original.denom}
            computeLiquidationPrice={computeLiquidationPrice}
            type='perp'
            amount={row.original.amount.toNumber()}
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
