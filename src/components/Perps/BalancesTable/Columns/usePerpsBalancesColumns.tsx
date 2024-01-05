import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import EntryPrice, { ENTRY_PRICE_META } from 'components/Perps/BalancesTable/Columns/EntryPrice'
import Manage, { MANAGE_META } from 'components/Perps/BalancesTable/Columns/Manage'
import { PERP_NAME_META, PerpName } from 'components/Perps/BalancesTable/Columns/PerpName'
import PerpType, { PERP_TYPE_META } from 'components/Perps/BalancesTable/Columns/PerpType'
import PnL, { PNL_META } from 'components/Perps/BalancesTable/Columns/PnL'
import Size, { SIZE_META } from 'components/Perps/BalancesTable/Columns/Size'
import { PerpPositionRow } from 'components/Perps/BalancesTable/usePerpsBalancesData'

export default function usePerpsBalancesTable() {
  return useMemo<ColumnDef<PerpPositionRow>[]>(() => {
    return [
      {
        ...PERP_NAME_META,
        cell: ({ row }) => <PerpName asset={row.original.asset} />,
      },
      {
        ...PERP_TYPE_META,
        cell: ({ row }) => <PerpType type={row.original.type} />,
      },
      {
        ...SIZE_META,
        cell: ({ row }) => <Size size={row.original.size} asset={row.original.asset} />,
      },
      {
        ...ENTRY_PRICE_META,
        cell: ({ row }) => (
          <EntryPrice entryPrice={row.original.entryPrice} asset={row.original.asset} />
        ),
      },
      {
        ...PNL_META,
        cell: ({ row }) => <PnL pnl={row.original.pnl} />,
      },
      {
        ...MANAGE_META,
        cell: ({ row }) => <Manage perpPosition={row.original} />,
      },
    ]
  }, [])
}
