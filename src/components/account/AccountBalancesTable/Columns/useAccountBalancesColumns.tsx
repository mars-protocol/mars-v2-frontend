import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/account/AccountBalancesTable/Columns/Apy'
import Asset, { ASSET_META } from 'components/account/AccountBalancesTable/Columns/Asset'
import LiqPrice, { LIQ_META } from 'components/account/AccountBalancesTable/Columns/LiqPrice'
import Price, { PRICE_META } from 'components/account/AccountBalancesTable/Columns/Price'
import Size, {
  SIZE_META,
  sizeSortingFn,
} from 'components/account/AccountBalancesTable/Columns/Size'
import Value, {
  VALUE_META,
  valueBalancesSortingFn,
} from 'components/account/AccountBalancesTable/Columns/Value'
import useMarketAssets from 'hooks/markets/useMarketAssets'
import useHealthComputer from 'hooks/useHealthComputer'
import useStore from 'store'

export default function useAccountBalancesColumns(
  account: Account,
  showLiquidationPrice?: boolean,
) {
  const { data: markets } = useMarketAssets()
  const updatedAccount = useStore((s) => s.updatedAccount)

  const { computeLiquidationPrice } = useHealthComputer(updatedAccount ?? account)

  return useMemo<ColumnDef<AccountBalanceRow>[]>(() => {
    return [
      {
        ...ASSET_META,
        cell: ({ row }) => <Asset type={row.original.type} symbol={row.original.symbol} />,
      },
      {
        ...VALUE_META,
        cell: ({ row }) => (
          <Value
            amountChange={row.original.amountChange}
            value={row.original.value}
            type={row.original.type}
          />
        ),
        sortingFn: valueBalancesSortingFn,
      },
      {
        ...SIZE_META,
        cell: ({ row }) => (
          <Size
            size={row.original.size}
            amountChange={row.original.amountChange}
            denom={row.original.denom}
            type={row.original.type}
          />
        ),
        sortingFn: sizeSortingFn,
      },
      ...(showLiquidationPrice
        ? [
            {
              ...PRICE_META,
              cell: ({ row }: { row: Row<AccountBalanceRow> }) => (
                <Price
                  type={row.original.type}
                  amount={row.original.amount.toNumber()}
                  denom={row.original.denom}
                />
              ),
            },
          ]
        : []),
      ...(showLiquidationPrice
        ? [
            {
              ...LIQ_META,
              enableSorting: false,
              cell: ({ row }: { row: Row<AccountBalanceRow> }) => (
                <LiqPrice
                  denom={row.original.denom}
                  computeLiquidationPrice={computeLiquidationPrice}
                  type={row.original.type}
                  amount={row.original.amount.toNumber()}
                  account={updatedAccount ?? account}
                />
              ),
            },
          ]
        : []),
      {
        ...APY_META,
        cell: ({ row }) => (
          <Apy
            apy={row.original.apy}
            markets={markets}
            denom={row.original.denom}
            type={row.original.type}
          />
        ),
      },
    ]
  }, [computeLiquidationPrice, markets, showLiquidationPrice, account, updatedAccount])
}
