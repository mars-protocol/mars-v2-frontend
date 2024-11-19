import { useMemo } from 'react'

export const useIsAmountExceedingMax = (amount: BigNumber, maxAmount: BigNumber) => {
  return useMemo(() => {
    return amount.isGreaterThan(maxAmount)
  }, [amount, maxAmount])
}
