import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import EntryPrice, { ENTRY_PRICE_META } from 'components/perps/BalancesTable/Columns/EntryPrice'
import Leverage, { LEVERAGE_META } from 'components/perps/BalancesTable/Columns/Leverage'
import Manage, { MANAGE_META } from 'components/perps/BalancesTable/Columns/Manage'
import { PERP_NAME_META, PerpName } from 'components/perps/BalancesTable/Columns/PerpName'
import PnL, { PNL_META } from 'components/perps/BalancesTable/Columns/PnL'
import Size, { SIZE_META, sizeSortingFn } from 'components/perps/BalancesTable/Columns/Size'
import { Status, STATUS_META } from 'components/perps/BalancesTable/Columns/Status'
import TradeDirection, {
  TRADE_DIRECTION_META,
} from 'components/perps/BalancesTable/Columns/TradeDirection'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import usePerpsLimitOrderRows from 'hooks/perps/usePerpsLimitOrdersRows'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import { demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { checkStopLossAndTakeProfit } from 'utils/perps'

interface Props {
  isOrderTable: boolean
}

export default function usePerpsBalancesColumns(props: Props) {
  const { isOrderTable } = props

  const activeLimitOrders = usePerpsLimitOrderRows()
  const { data: rawLimitOrders } = usePerpsLimitOrders()

  const parentChildMapping = useMemo(() => {
    if (!rawLimitOrders) return {}

    const mapping: Record<string, { hasSL: boolean; hasTP: boolean }> = {}

    rawLimitOrders.forEach((order) => {
      mapping[order.order.order_id] = { hasSL: false, hasTP: false }
    })

    rawLimitOrders.forEach((order) => {
      const triggerCondition = order.order.conditions.find((c) => 'trigger_order_executed' in c)
      if (!triggerCondition || !('trigger_order_executed' in triggerCondition)) return

      const parentId = triggerCondition.trigger_order_executed.trigger_order_id
      if (!parentId || !mapping[parentId]) return

      const oraclePriceCondition = order.order.conditions.find((c) => 'oracle_price' in c)
      if (!oraclePriceCondition || !('oracle_price' in oraclePriceCondition)) return

      const perpAction = order.order.actions.find((a) => 'execute_perp_order' in a)
      if (
        !perpAction ||
        !('execute_perp_order' in perpAction) ||
        !perpAction.execute_perp_order.reduce_only
      )
        return

      const parentOrder = rawLimitOrders.find((o) => o.order.order_id === parentId)
      if (!parentOrder) return

      const parentAction = parentOrder.order.actions.find((a) => 'execute_perp_order' in a)
      if (!parentAction || !('execute_perp_order' in parentAction)) return

      const isLong = !parentAction.execute_perp_order.order_size.startsWith('-')
      const comparison = oraclePriceCondition.oracle_price.comparison

      if ((isLong && comparison === 'greater_than') || (!isLong && comparison === 'less_than')) {
        mapping[parentId].hasTP = true
      } else if (
        (isLong && comparison === 'less_than') ||
        (!isLong && comparison === 'greater_than')
      ) {
        mapping[parentId].hasSL = true
      }
    })

    return mapping
  }, [rawLimitOrders])

  const staticColumns = useMemo<ColumnDef<PerpPositionRow>[]>(
    () => [
      {
        ...PERP_NAME_META,
        cell: ({ row }) => <PerpName asset={row.original.asset} />,
        meta: { className: 'min-w-32 w-32' },
      },
      {
        ...TRADE_DIRECTION_META,
        cell: ({ row }) => {
          const { type, tradeDirection, reduce_only, amount, denom } = row.original
          return (
            <TradeDirection
              tradeDirection={tradeDirection}
              reduce_only={type !== 'market' && reduce_only}
              amount={amount}
              denom={denom}
              type={type}
              showPositionEffect={isOrderTable}
            />
          )
        },
        meta: { className: 'min-w-28 w-28' },
      },
      {
        ...SIZE_META,
        id: 'size',
        cell: ({ row }) => {
          const { asset, amount, type, entryPrice } = row.original
          const demagnifiedAmount = BN(demagnify(amount, asset))

          let value
          if (type === 'market') {
            value = demagnifiedAmount.times(BN(asset.price?.amount || 0))
          } else {
            value = demagnifiedAmount
              .times(entryPrice)
              .shiftedBy(asset.decimals - PRICE_ORACLE_DECIMALS)
          }

          return <Size amount={row.original.amount} asset={row.original.asset} value={value} />
        },
        sortingFn: sizeSortingFn,
      },
      ...(isOrderTable
        ? []
        : [
            {
              ...LEVERAGE_META,
              cell: ({ row }: { row: Row<PerpPositionRow> }) => {
                const { liquidationPrice, leverage } = row.original
                return <Leverage liquidationPrice={liquidationPrice} leverage={leverage} />
              },
            },
          ]),
      {
        ...ENTRY_PRICE_META(isOrderTable),
        id: isOrderTable ? 'triggerPrice' : 'entryPrice',
        cell: ({ row }) => (
          <EntryPrice
            entryPrice={row.original.entryPrice}
            currentPrice={row.original.currentPrice}
            asset={row.original.asset}
            type={row.original.type}
            tradeDirection={row.original.tradeDirection}
          />
        ),
      },
      ...(isOrderTable
        ? []
        : [
            {
              ...PNL_META,
              cell: ({ row }: { row: Row<PerpPositionRow> }) => (
                <PnL pnl={row.original.pnl} type={row.original.type} position={row.original} />
              ),
            },
          ]),
      {
        ...MANAGE_META,
        cell: ({ row }) => <Manage perpPosition={row.original} />,
        meta: { className: 'w-48 min-w-48' },
      },
    ],
    [isOrderTable],
  )

  const typeColumn = useMemo<ColumnDef<PerpPositionRow>>(
    () => ({
      ...STATUS_META,
      cell: ({ row }) => {
        const position = row.original

        let hasStopLoss = false
        let hasTakeProfit = false

        if (position.orderId && parentChildMapping[position.orderId]) {
          hasStopLoss = parentChildMapping[position.orderId].hasSL
          hasTakeProfit = parentChildMapping[position.orderId].hasTP
        } else {
          const result = checkStopLossAndTakeProfit(position, activeLimitOrders)
          hasStopLoss = result.hasStopLoss
          hasTakeProfit = result.hasTakeProfit
        }

        return (
          <Status
            type={position.type}
            hasStopLoss={hasStopLoss}
            hasTakeProfit={hasTakeProfit}
            showIndicators={
              position.type === 'market' || (!!position.orderId && (hasStopLoss || hasTakeProfit))
            }
          />
        )
      },
    }),
    [activeLimitOrders, parentChildMapping],
  )

  return useMemo(() => {
    const allColumns = [...staticColumns]
    allColumns.splice(1, 0, typeColumn)
    return allColumns
  }, [staticColumns, typeColumn])
}
