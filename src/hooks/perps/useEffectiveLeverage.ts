import { useMemo } from 'react'

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
      if (amount.isGreaterThan(maxAmount)) {
        return maxLeverage
      }
      return Math.max(leverage, 0)
    }
    return getEffectiveLeverage(amount, maxAmount, leverage, maxLeverage)
  }, [amount, maxAmount, leverage, maxLeverage])
}
