import Text from 'components/common/Text'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'

export const STATUS_META = {
  accessorKey: 'type',
  header: 'Status',
  id: 'status',
  meta: { className: 'min-w-20 w-20' },
}

interface Props {
  type: string
  hasStopLoss?: boolean
  hasTakeProfit?: boolean
  showIndicators: boolean
  orderId?: string
}

export function Status({ type, hasStopLoss, hasTakeProfit, showIndicators, orderId }: Props) {
  const displayStatus = type === 'market' ? 'Open' : type
  const { data: limitOrders } = usePerpsLimitOrders()

  let hasChildTP = hasTakeProfit
  let hasChildSL = hasStopLoss

  if (orderId && limitOrders) {
    const parentOrder = limitOrders.find((p) => p.order.order_id === orderId)
    const parentAction = parentOrder?.order.actions[0] as any
    const isLong =
      parentAction?.execute_perp_order &&
      parseFloat(parentAction.execute_perp_order.order_size) >= 0

    limitOrders
      .filter((order) =>
        order.order.conditions.some(
          (condition) =>
            'trigger_order_executed' in condition &&
            condition.trigger_order_executed.trigger_order_id === orderId,
        ),
      )
      .forEach((child) => {
        const oraclePriceCondition = child.order.conditions.find((c) => 'oracle_price' in c) as any
        if (!oraclePriceCondition) return

        const childAction = child.order.actions[0] as any
        if (!childAction?.execute_perp_order?.reduce_only) return

        const comparisonType = oraclePriceCondition.oracle_price.comparison
        const isGreaterThan = comparisonType === 'greater_than'

        if ((isLong && isGreaterThan) || (!isLong && !isGreaterThan)) {
          hasChildTP = true
        } else {
          hasChildSL = true
        }
      })
  }

  return (
    <div className='flex flex-col items-end'>
      <Text size='xs' className='capitalize'>
        {displayStatus}
      </Text>
      {showIndicators && (hasChildSL || hasChildTP) && (
        <div className='flex items-center justify-center gap-1 mt-1 '>
          {hasChildSL && <span className='px-1 text-xs rounded bg-white/10 text-white/60'>SL</span>}
          {hasChildTP && <span className='px-1 text-xs rounded bg-white/10 text-white/60'>TP</span>}
        </div>
      )}
    </div>
  )
}
