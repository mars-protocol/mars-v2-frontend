import { useCallback } from 'react'
import BigNumber from 'bignumber.js'

export const useHandleClosing = (
  currentPerpPosition: PerpsPosition | undefined,
  isStopOrder: boolean,
  stopTradeDirection: TradeDirection,
  tradeDirection: TradeDirection,
  updateAmount: (amount: BigNumber) => void,
  setIsReduceOnly: (value: boolean) => void,
) => {
  return useCallback(() => {
    if (currentPerpPosition) {
      if (isStopOrder) {
        updateAmount(
          stopTradeDirection === 'short'
            ? currentPerpPosition.amount.negated()
            : currentPerpPosition.amount.abs(),
        )
        setIsReduceOnly(true)
      } else {
        updateAmount(
          tradeDirection === 'short'
            ? currentPerpPosition.amount.negated()
            : currentPerpPosition.amount.abs(),
        )
      }
    }
  }, [
    currentPerpPosition,
    isStopOrder,
    stopTradeDirection,
    tradeDirection,
    updateAmount,
    setIsReduceOnly,
  ])
}
