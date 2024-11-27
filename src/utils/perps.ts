import { BN_ONE, BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { TriggerOrderResponse } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { ConfigForString } from 'types/generated/mars-perps/MarsPerps.types'
import { byDenom } from 'utils/array'
import { LiquidationPriceKind } from 'utils/health_computer'
import { BN } from 'utils/helpers'

export const checkStopLossAndTakeProfit = (
  position: PerpPositionRow,
  activeLimitOrders: PerpPositionRow[],
) => {
  const limitOrders = activeLimitOrders.filter((order) => order.denom === position.denom)

  const hasStopLoss = limitOrders.some(
    (order) =>
      (position.tradeDirection === 'long' &&
        BN(order.entryPrice).isLessThan(BN(position.currentPrice))) ||
      (position.tradeDirection === 'short' &&
        BN(order.entryPrice).isGreaterThan(BN(position.currentPrice))),
  )

  const hasTakeProfit = limitOrders.some(
    (order) =>
      (position.tradeDirection === 'long' &&
        BN(order.entryPrice).isGreaterThan(BN(position.currentPrice))) ||
      (position.tradeDirection === 'short' &&
        BN(order.entryPrice).isLessThan(BN(position.currentPrice))),
  )

  return { hasStopLoss, hasTakeProfit }
}

export const isStopOrder = (perpOrder: any, perpTrigger: any): PositionType => {
  const isLong = BN(perpOrder.order_size).isGreaterThanOrEqualTo(0)

  if (isLong) {
    return perpTrigger.comparison !== 'less_than'
      ? ('stop' as PositionType)
      : ('limit' as PositionType)
  }
  return perpTrigger.comparison !== 'greater_than'
    ? ('stop' as PositionType)
    : ('limit' as PositionType)
}

export const convertTriggerOrderResponseToPerpPosition = (
  limitOrder: TriggerOrderResponse,
  perpAssets: Asset[],
  perpsConfig: ConfigForString,
  computeLiquidationPrice: (denom: string, kind: LiquidationPriceKind) => number | null,
) => {
  const zeroCoin = BNCoin.fromDenomAndBigNumber(perpsConfig.base_denom, BN_ZERO)
  const limitOrderAction = limitOrder.order.actions[0] as ExceutePerpsOrder | undefined
  const limitOrderCondition = limitOrder.order.conditions[0] as TriggerCondition | undefined

  if (!limitOrderAction || !limitOrderCondition) return
  const perpOrder = limitOrderAction.execute_perp_order
  const perpTrigger = limitOrderCondition.oracle_price
  const asset = perpAssets.find(byDenom(perpOrder.denom))!
  const amount = BN(perpOrder.order_size)
  if (!asset) return

  const tradeDirection: TradeDirection = BN(perpOrder.order_size).isGreaterThanOrEqualTo(0)
    ? 'long'
    : 'short'

  const liquidationPrice = computeLiquidationPrice(perpOrder.denom, 'perp')
  return {
    orderId: limitOrder.order.order_id,
    asset,
    denom: perpOrder.denom,
    baseDenom: perpsConfig.base_denom,
    tradeDirection,
    amount: amount.abs(),
    type: isStopOrder(perpOrder, perpTrigger),
    reduce_only: perpOrder.reduce_only ?? false,
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
    entryPrice: BN(perpTrigger.price),
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
  } else {
    if (formattedStopPrice.isGreaterThanOrEqualTo(formattedCurrentPrice)) {
      return {
        isValid: false,
        errorMessage: 'Stop price must be above current price for short positions',
      }
    }
  }

  return { isValid: true, errorMessage: null }
}

export const FALLBACK_MIN_KEEPER_FEE = {
  denom: 'uusdc',
  amount: '100000',
}
