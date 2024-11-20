import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'

export const useEffectiveLeverage = (
  amount: BigNumber,
  maxAmount: BigNumber,
  leverage: number,
  maxLeverage: number,
) => {
  return useMemo(() => {
    const getEffectiveLeverage = (
      amount: BigNumber,
      maxAmount: BigNumber,
      leverage: number,
      maxLeverage: number,
    ) => {
      if (amount.isGreaterThan(maxAmount) && leverage >= maxLeverage) {
        return maxLeverage
      }
      return Math.max(leverage, 0)
    }
    return getEffectiveLeverage(amount, maxAmount, leverage, maxLeverage)
  }, [amount, maxAmount, leverage, maxLeverage])
}
