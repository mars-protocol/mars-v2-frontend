import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/Account/AccountBalancesTable/Columns/Apy'
import Asset, { ASSET_META } from 'components/Account/AccountBalancesTable/Columns/Asset'
import Size, {
  SIZE_META,
  sizeSortingFn,
} from 'components/Account/AccountBalancesTable/Columns/Size'
import Value, {
  VALUE_META,
  valueSortingFn,
} from 'components/Account/AccountBalancesTable/Columns/Value'
import useMarketAssets from 'hooks/useMarketAssets'

export default function useAccountBalancesColumns() {
  const { data: markets } = useMarketAssets()

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

        sortingFn: valueSortingFn,
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
  }, [markets])
}
