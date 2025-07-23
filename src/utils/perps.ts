import { BN_ONE, BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { TriggerOrder } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { ConfigForString } from 'types/generated/mars-perps/MarsPerps.types'
import { byDenom } from 'utils/array'
import { LiquidationPriceKind } from 'utils/health_computer'
import { BN } from 'utils/helpers'

// Helper function to determine if an order is a take profit or stop loss
function classifyChildOrder(
  order: LimitOrderData,
  parentOrder: LimitOrderData,
): 'takeProfit' | 'stopLoss' | 'unknown' {
  const oraclePriceCondition = order.order.conditions.find(
    (c): c is TriggerCondition => 'oracle_price' in c,
  )
  if (!oraclePriceCondition) return 'unknown'

  const perpAction = order.order.actions.find(
    (a): a is ExecutePerpOrderAction => 'execute_perp_order' in a,
  )
  if (!perpAction?.execute_perp_order?.reduce_only) {
    return 'unknown'
  }

  const parentAction = parentOrder.order.actions.find(
    (a): a is ExecutePerpOrderAction => 'execute_perp_order' in a,
  )
  if (!parentAction) return 'unknown'

  const isLong = !parentAction.execute_perp_order.order_size.startsWith('-')
  const comparison = oraclePriceCondition.oracle_price.comparison

  if ((isLong && comparison === 'greater_than') || (!isLong && comparison === 'less_than')) {
    return 'takeProfit'
  } else if ((isLong && comparison === 'less_than') || (!isLong && comparison === 'greater_than')) {
    return 'stopLoss'
  }

  return 'unknown'
}

// Helper function to build parent-child mapping with SL/TP indicators
export function buildParentChildMapping(
  rawLimitOrders: LimitOrderData[],
): Record<string, SLTPIndicators> {
  const mapping: Record<string, SLTPIndicators> = {}

  // Initialize all orders
  rawLimitOrders.forEach((order) => {
    mapping[order.order.order_id] = { hasSL: false, hasTP: false }
  })

  // Process child orders
  rawLimitOrders.forEach((order) => {
    const triggerCondition = order.order.conditions.find(
      (c): c is TriggerOrderExecutedCondition => 'trigger_order_executed' in c,
    )
    if (!triggerCondition) return

    const parentId = triggerCondition.trigger_order_executed.trigger_order_id
    if (!parentId || !mapping[parentId]) return

    const parentOrder = rawLimitOrders.find((o) => o.order.order_id === parentId)
    if (!parentOrder) return

    const orderType = classifyChildOrder(order, parentOrder)

    switch (orderType) {
      case 'takeProfit':
        mapping[parentId].hasTP = true
        break
      case 'stopLoss':
        mapping[parentId].hasSL = true
        break
    }
  })

  return mapping
}

// Helper function to determine SL/TP for positions without parent mapping
export function getPositionSLTPIndicators(
  position: PerpPositionRow,
  rawLimitOrders: LimitOrderData[],
): SLTPIndicators {
  const indicators: SLTPIndicators = { hasSL: false, hasTP: false }

  rawLimitOrders.forEach((order) => {
    const perpAction = order.order.actions.find(
      (a): a is ExecutePerpOrderAction => 'execute_perp_order' in a,
    )
    if (!perpAction || perpAction.execute_perp_order.denom !== position.denom) {
      return
    }

    const oraclePriceCondition = order.order.conditions.find(
      (c): c is TriggerCondition => 'oracle_price' in c,
    )
    if (!oraclePriceCondition) return

    const comparison = oraclePriceCondition.oracle_price.comparison
    const isLong = position.tradeDirection === 'long'

    if ((isLong && comparison === 'greater_than') || (!isLong && comparison === 'less_than')) {
      indicators.hasTP = true
    } else if (
      (isLong && comparison === 'less_than') ||
      (!isLong && comparison === 'greater_than')
    ) {
      indicators.hasSL = true
    }
  })

  return indicators
}

export const isStopOrder = (
  perpOrder: PerpOrderType,
  perpTrigger: TriggerConditionType,
): PositionType => {
  const isLong = BN(perpOrder?.order_size ?? 0).isGreaterThanOrEqualTo(0)

  if (isLong) {
    return perpTrigger?.comparison !== 'less_than'
      ? ('stop' as PositionType)
      : ('limit' as PositionType)
  }
  return perpTrigger?.comparison !== 'greater_than'
    ? ('stop' as PositionType)
    : ('limit' as PositionType)
}

export const convertTriggerOrderResponseToPerpPosition = (
  limitOrder: { order: TriggerOrder },
  perpAssets: Asset[],
  perpsConfig: ConfigForString,
  computeLiquidationPrice: (denom: string, kind: LiquidationPriceKind) => number | null,
) => {
  const zeroCoin = BNCoin.fromDenomAndBigNumber(perpsConfig.base_denom, BN_ZERO)
  const limitOrderAction = limitOrder.order.actions[0] as ExceutePerpsOrder | undefined

  if (!limitOrderAction) return
  const perpOrder = limitOrderAction.execute_perp_order

  const oraclePriceCondition = limitOrder.order.conditions.find(
    (condition): condition is TriggerCondition => 'oracle_price' in condition,
  )

  const triggerOrderCondition = limitOrder.order.conditions.find(
    (condition): condition is TriggerOrderExecutedCondition =>
      'trigger_order_executed' in condition,
  )
  const isChildOrder = !!triggerOrderCondition && 'trigger_order_executed' in triggerOrderCondition

  const perpTrigger = oraclePriceCondition?.oracle_price

  const asset = perpAssets.find(byDenom(perpOrder.denom))!
  const amount = BN(perpOrder.order_size)
  if (!asset) return

  const tradeDirection: TradeDirection = BN(perpOrder.order_size).isGreaterThanOrEqualTo(0)
    ? 'long'
    : 'short'

  const liquidationPrice = computeLiquidationPrice(perpOrder.denom, 'perp')

  const orderType = isStopOrder(perpOrder, perpTrigger)

  return {
    orderId: limitOrder.order.order_id,
    asset,
    denom: perpOrder.denom,
    baseDenom: perpsConfig.base_denom,
    tradeDirection,
    amount: amount.abs(),
    type: orderType,
    reduce_only: perpOrder.reduce_only ?? false,
    isChildOrder,
    pnl: {
      net: BNCoin.fromCoin(limitOrder.order.keeper_fee).negated(),
      realized: {
        fees: zeroCoin,
        funding: zeroCoin,
        net: zeroCoin,
        price: zeroCoin,
      },
      unrealized: {
        fees: zeroCoin,
        funding: zeroCoin,
        net: zeroCoin,
        price: zeroCoin,
      },
    },
    entryPrice: perpTrigger ? BN(perpTrigger.price) : BN_ZERO,
    currentPrice: BN(asset.price?.amount ?? 0).shiftedBy(-asset.decimals + PRICE_ORACLE_DECIMALS),
    liquidationPrice: liquidationPrice !== null ? BN(liquidationPrice) : BN_ONE,
    leverage: 1,
  }
}

export const validateStopOrderPrice = (
  stopPrice: BigNumber,
  currentPrice: BigNumber,
  tradeDirection: TradeDirection,
): { isValid: boolean; errorMessage: string | null } => {
  const formattedStopPrice = BN(stopPrice.toFixed(18, 1))
  const formattedCurrentPrice = BN(currentPrice.toFixed(18, 1))

  if (formattedStopPrice.isZero() || formattedCurrentPrice.isZero()) {
    return { isValid: false, errorMessage: null }
  }

  if (tradeDirection === 'long') {
    if (formattedStopPrice.isLessThanOrEqualTo(formattedCurrentPrice)) {
      return {
        isValid: false,
        errorMessage: 'Stop price must be below current price for long positions',
      }
    }
  } else if (formattedStopPrice.isGreaterThanOrEqualTo(formattedCurrentPrice)) {
    return {
      isValid: false,
      errorMessage: 'Stop price must be above current price for short positions',
    }
  }

  return { isValid: true, errorMessage: null }
}
