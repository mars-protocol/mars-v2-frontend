import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import useWhitelistedAssets from '../../../../hooks/assets/useWhitelistedAssets'
import useHealthComputer from '../../../../hooks/health-computer/useHealthComputer'
import useStore from '../../../../store'
import { byDenom } from '../../../../utils/array'
import LiqPrice, { LIQ_META } from '../../AccountBalancesTable/Columns/LiqPrice'
import Value, { VALUE_META, valuePerpSortingFn } from '../../AccountBalancesTable/Columns/Value'
import Asset, { ASSET_META } from './Asset'
import TotalPnL, { PNL_META } from './TotalPnL'

export default function useAccountPerpsColumns(account: Account) {
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { computeLiquidationPrice } = useHealthComputer(updatedAccount ?? account)
  const whitelistedAssets = useWhitelistedAssets()

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
            isWhitelisted={whitelistedAssets.find(byDenom(row.original.denom)) !== undefined}
          />
        ),
      },
      {
        ...PNL_META,
        cell: ({ row }) => <TotalPnL pnl={row.original.pnl} />,
      },
    ]
  }, [computeLiquidationPrice, account, updatedAccount, whitelistedAssets])
}
