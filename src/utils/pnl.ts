export function calculatePnLPercentage(
  entryPrice: BigNumber,
  currentOrLimitPrice: BigNumber,
  size: BigNumber,
  isLong: boolean,
): {
  pnlAmount: BigNumber
  pnlPercentage: BigNumber
} {
  const priceDiff = currentOrLimitPrice.minus(entryPrice)

  const adjustedPriceDiff = isLong ? priceDiff : priceDiff.negated()

  const pnlAmount = adjustedPriceDiff.times(size.abs())
  const pnlPercentage = priceDiff.div(entryPrice).times(100)

  return {
    pnlAmount,
    pnlPercentage: isLong ? pnlPercentage : pnlPercentage.negated(),
  }
}
