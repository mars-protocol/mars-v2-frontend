import { ColumnDef } from '@tanstack/react-table'
import BigNumber from 'bignumber.js'
import Name, { NAME_META } from 'components/borrow/Table/Columns/Name'
import TVL from 'components/earn/farm/common/Table/Columns/TVL'
import Apr from 'components/managedVaults/common/table/columns/Apr'
import { useMemo } from 'react'

export default function useVaultBalances() {
  return useMemo<ColumnDef<any>[]>(
    () => [
      {
        ...NAME_META,
        cell: ({ row }) => <Name data={row.original} />,
      },
      {
        header: 'Value',
        meta: { className: 'w-30' },
        cell: ({ row }) => <TVL amount={BigNumber(row.original.value)} denom={'usd'} />,
      },
      {
        header: 'Liquidation Price',
        meta: { className: 'w-30' },
        cell: ({ row }) => <TVL amount={BigNumber(row.original.liquidationPrice)} denom={'usd'} />,
      },
      {
        header: 'APY',
        meta: { className: 'w-25' },
        cell: ({ row }) => <Apr value={row.original.apy} />,
      },
    ],
    [],
  )
}
