import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import EntryPrice, { ENTRY_PRICE_META } from 'components/perps/BalancesTable/Columns/EntryPrice'
import Leverage, { LEVERAGE_META } from 'components/perps/BalancesTable/Columns/Leverage'
import Manage, { MANAGE_META } from 'components/perps/BalancesTable/Columns/Manage'
import { PERP_NAME_META, PerpName } from 'components/perps/BalancesTable/Columns/PerpName'
import PnL, { PNL_META } from 'components/perps/BalancesTable/Columns/PnL'
import Size, { SIZE_META, sizeSortingFn } from 'components/perps/BalancesTable/Columns/Size'
import TradeDirection, {
  TRADE_DIRECTION_META,
} from 'components/perps/BalancesTable/Columns/TradeDirection'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { Status, STATUS_META } from 'components/perps/BalancesTable/Columns/Status'
import usePerpsLimitOrderRows from 'hooks/perps/usePerpsLimitOrdersRows'
import { checkStopLossAndTakeProfit } from 'utils/perps'

interface Props {
  isOrderTable: boolean
}

export default function usePerpsBalancesColumns(props: Props) {
  const { isOrderTable } = props

  const activeLimitOrders = usePerpsLimitOrderRows()
  const staticColumns = useMemo<ColumnDef<PerpPositionRow>[]>(
    () => [
      {
        ...PERP_NAME_META,
        cell: ({ row }) => <PerpName asset={row.original.asset} />,
      },
      {
        ...TRADE_DIRECTION_META,
        id: 'direction',
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
      },
      {
        ...SIZE_META,
        id: 'entryPrice',
        cell: ({ row }) => {
          const { asset, amount, type, entryPrice } = row.original
          const demagnifiedAmount = BN(demagnify(amount, asset))

          let value
          if (type === 'limit') {
            value = demagnifiedAmount
              .times(entryPrice)
              .shiftedBy(asset.decimals - PRICE_ORACLE_DECIMALS)
          } else {
            value = demagnifiedAmount.times(BN(asset.price?.amount || 0))
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
                <PnL pnl={row.original.pnl} type={row.original.type} />
              ),
            },
          ]),
      {
        ...MANAGE_META,
        cell: ({ row }) => <Manage perpPosition={row.original} />,
      },
    ],
    [isOrderTable],
  )

  const typeColumn = useMemo<ColumnDef<PerpPositionRow>>(
    () => ({
      ...STATUS_META,
      cell: ({ row }) => {
        const position = row.original
        const { hasStopLoss, hasTakeProfit } = checkStopLossAndTakeProfit(
          position,
          activeLimitOrders,
        )
        return (
          <Status
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
