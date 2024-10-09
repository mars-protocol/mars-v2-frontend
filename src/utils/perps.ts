import BigNumber from 'bignumber.js'

export const checkStopLossAndTakeProfit = (
  position: PerpPositionRow,
  activeLimitOrders: PerpPositionRow[],
) => {
  const limitOrders = activeLimitOrders.filter((order) => order.denom === position.denom)

  const hasStopLoss = limitOrders.some(
    (order) =>
      (position.tradeDirection === 'long' &&
        new BigNumber(order.entryPrice).isLessThan(new BigNumber(position.currentPrice))) ||
      (position.tradeDirection === 'short' &&
        new BigNumber(order.entryPrice).isGreaterThan(new BigNumber(position.currentPrice))),
  )

  const hasTakeProfit = limitOrders.some(
    (order) =>
      (position.tradeDirection === 'long' &&
        new BigNumber(order.entryPrice).isGreaterThan(new BigNumber(position.currentPrice))) ||
      (position.tradeDirection === 'short' &&
        new BigNumber(order.entryPrice).isLessThan(new BigNumber(position.currentPrice))),
  )

  return { hasStopLoss, hasTakeProfit }
}
