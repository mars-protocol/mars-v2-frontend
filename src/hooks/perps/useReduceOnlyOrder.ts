import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from 'bignumber.js'

export const useReduceOnlyOrder = (
  isReduceOnly: boolean,
  currentPerpPosition: PerpsPosition | undefined,
  amount: BigNumber,
) => {
  const [reduceOnlyWarning, setReduceOnlyWarning] = useState<string | null>(null)

  const validateReduceOnlyOrder = useCallback(() => {
    if (!isReduceOnly || !currentPerpPosition) {
      setReduceOnlyWarning(null)
      return true
    }

    const isIncreasingPosition =
      (currentPerpPosition.tradeDirection === 'long' && amount.isGreaterThan(0)) ||
      (currentPerpPosition.tradeDirection === 'short' && amount.isLessThan(0))

    const isFlippingPosition =
      (currentPerpPosition.tradeDirection === 'long' && amount.isLessThan(0)) ||
      (currentPerpPosition.tradeDirection === 'short' && amount.isGreaterThan(0))

    if (
      isIncreasingPosition ||
      (isFlippingPosition && amount.abs().isGreaterThan(currentPerpPosition.amount.abs()))
    ) {
      setReduceOnlyWarning(
        'This order violates the Reduce-Only setting. Reduce-Only orders can only decrease your current position size or close it entirely. Please uncheck Reduce-Only or adjust your order size.',
      )
    } else {
      setReduceOnlyWarning(null)
    }

    return true
  }, [isReduceOnly, currentPerpPosition, amount])

  useEffect(() => {
    validateReduceOnlyOrder()
  }, [validateReduceOnlyOrder, amount, isReduceOnly])

  return { reduceOnlyWarning, validateReduceOnlyOrder }
}
