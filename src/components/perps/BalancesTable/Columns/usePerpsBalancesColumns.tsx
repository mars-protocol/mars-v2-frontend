import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import EntryPrice, { ENTRY_PRICE_META } from 'components/perps/BalancesTable/Columns/EntryPrice'
import Leverage, { LEVERAGE_META } from 'components/perps/BalancesTable/Columns/Leverage'
import Manage, { MANAGE_META } from 'components/perps/BalancesTable/Columns/Manage'
import { PERP_NAME_META, PerpName } from 'components/perps/BalancesTable/Columns/PerpName'
import PnL, { PNL_META } from 'components/perps/BalancesTable/Columns/PnL'
import Size, { SIZE_META, sizeSortingFn } from 'components/perps/BalancesTable/Columns/Size'
import TradeDirection, {
  PERP_TYPE_META,
} from 'components/perps/BalancesTable/Columns/TradeDirection'
import { Type, TYPE_META } from 'components/perps/BalancesTable/Columns/Type'
import { demagnify } from 'utils/formatters'
import usePerpsLimitOrdersData from '../usePerpsLimitOrdersData'
import { checkStopLossAndTakeProfit } from 'utils/perps'
import { BN } from 'utils/helpers'

export default function usePerpsBalancesColumns() {
  const activeLimitOrders = usePerpsLimitOrdersData()

  const staticColumns = useMemo<ColumnDef<PerpPositionRow>[]>(
    () => [
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
        cell: ({ row }) => {
          const { asset, amount, type, entryPrice } = row.original
          const price = type === 'limit' ? entryPrice : BN(asset.price?.amount || 0)
          const demagnifiedAmount = BN(demagnify(amount, asset))
          const value = demagnifiedAmount.times(price)
          return <Size amount={row.original.amount} asset={row.original.asset} value={value} />
        },
        sortingFn: sizeSortingFn,
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
          <EntryPrice
            entryPrice={row.original.entryPrice}
            currentPrice={row.original.currentPrice}
            asset={row.original.asset}
          />
        ),
      },
      {
        ...PNL_META,
        cell: ({ row }) => <PnL pnl={row.original.pnl} type={row.original.type} />,
      },
      {
        ...MANAGE_META,
        cell: ({ row }) => <Manage perpPosition={row.original} />,
      },
    ],
    [],
  )

  const typeColumn = useMemo<ColumnDef<PerpPositionRow>>(
    () => ({
      ...TYPE_META,
      cell: ({ row }) => {
        const position = row.original
        const { hasStopLoss, hasTakeProfit } = checkStopLossAndTakeProfit(
          position,
          activeLimitOrders,
        )
        return (
          <Type
            type={position.type}
            hasStopLoss={hasStopLoss}
            hasTakeProfit={hasTakeProfit}
            showIndicators={position.type !== 'limit'}
          />
        )
      },
    }),
    [activeLimitOrders],
  )

  return useMemo(() => {
    const allColumns = [...staticColumns]
    allColumns.splice(1, 0, typeColumn)
    return allColumns
  }, [staticColumns, typeColumn])
}
