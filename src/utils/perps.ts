import { BN } from './helpers'

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
