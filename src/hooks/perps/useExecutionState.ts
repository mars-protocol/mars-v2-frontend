import { useMemo } from 'react'
import { BN_ZERO } from 'constants/math'

export const useExecutionState = ({
  amount,
  maxAmount,
  warningMessages,
  isStopOrder,
  stopPrice,
  stopTradeDirection,
  perpsAsset,
  isLimitOrder,
  limitPriceInfo,
  limitPrice,
}: {
  amount: BigNumber
  maxAmount: BigNumber
  warningMessages: string[]
  isStopOrder: boolean
  stopPrice: BigNumber
  stopTradeDirection: TradeDirection
  perpsAsset: Asset
  isLimitOrder: boolean
  limitPriceInfo: CallOut | undefined
  limitPrice: BigNumber
}) => {
  const isDisabledExecution = useMemo(() => {
    const baseConditions =
      amount.isZero() || amount.isGreaterThan(maxAmount) || warningMessages.length > 0

    if (isStopOrder) {
      if (stopPrice.isZero()) return true
      const currentPrice = perpsAsset?.price?.amount ?? BN_ZERO
      if (currentPrice.isZero()) return true

      if (stopTradeDirection === 'long') {
        return stopPrice.isLessThanOrEqualTo(currentPrice)
      }
      return stopPrice.isGreaterThanOrEqualTo(currentPrice)
    }

    if (isLimitOrder) {
      return baseConditions || !!limitPriceInfo || limitPrice.isZero()
    }

    return baseConditions
  }, [
    amount,
    maxAmount,
    warningMessages,
    isStopOrder,
    stopPrice,
    stopTradeDirection,
    perpsAsset?.price?.amount,
    isLimitOrder,
    limitPriceInfo,
    limitPrice,
  ])

  const isDisabledAmountInput = useMemo(() => {
    if (!isLimitOrder) return false
    return limitPrice.isZero() || !!limitPriceInfo
  }, [limitPrice, limitPriceInfo, isLimitOrder])

  return {
    isDisabledExecution,
    isDisabledAmountInput,
  }
}
