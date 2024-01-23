import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import EntryPrice, { ENTRY_PRICE_META } from 'components/perps/BalancesTable/Columns/EntryPrice'
import Leverage, { LEVERAGE_META } from 'components/perps/BalancesTable/Columns/Leverage'
import Manage, { MANAGE_META } from 'components/perps/BalancesTable/Columns/Manage'
import { PERP_NAME_META, PerpName } from 'components/perps/BalancesTable/Columns/PerpName'
import PnL, { PNL_META } from 'components/perps/BalancesTable/Columns/PnL'
import Size, { SIZE_META } from 'components/perps/BalancesTable/Columns/Size'
import TradeDirection, {
  PERP_TYPE_META,
} from 'components/perps/BalancesTable/Columns/TradeDirection'

export default function usePerpsBalancesTable() {
  return useMemo<ColumnDef<PerpPositionRow>[]>(() => {
    return [
      {
        ...PERP_NAME_META,
        cell: ({ row }) => <PerpName asset={row.original.asset} />,
      },
      {
        ...PERP_TYPE_META,
        cell: ({ row }) => <TradeDirection tradeDirection={row.original.tradeDirection} />,
      },
      {
        ...SIZE_META,
        cell: ({ row }) => <Size amount={row.original.amount} asset={row.original.asset} />,
      },
      {
        ...LEVERAGE_META,
        cell: ({ row }) => (
          <Leverage
            liquidationPrice={row.original.liquidationPrice}
            leverage={row.original.leverage}
          />
        ),
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
