import { useMemo } from 'react'
import BigNumber from 'bignumber.js'

interface PriceValidationResult {
  isValid: boolean
  stopLossError: string | null
  takeProfitError: string | null
}

interface PriceValidationProps {
  currentPrice: BigNumber
  currentTradeDirection: TradeDirection
  showStopLoss: boolean
  stopLossPrice: BigNumber
  showTakeProfit: boolean
  takeProfitPrice: BigNumber
}

export const validatePrice = (
  isShort: boolean,
  currentPrice: BigNumber,
  price: BigNumber,
  orderType: 'Stop Loss' | 'Take Profit',
): string | null => {
  if (!price.isZero()) {
    const isStopLoss = orderType === 'Stop Loss'
    const shouldBeLower = (isStopLoss && !isShort) || (!isStopLoss && isShort)

    if (shouldBeLower && price.isGreaterThanOrEqualTo(currentPrice)) {
      return `${orderType} price must be lower than the current price for ${isShort ? 'short' : 'long'} positions`
    }

    if (!shouldBeLower && price.isLessThanOrEqualTo(currentPrice)) {
      return `${orderType} price must be higher than the current price for ${isShort ? 'short' : 'long'} positions`
    }
  }
  return null
}

const usePriceValidation = ({
  currentPrice,
  currentTradeDirection,
  showStopLoss,
  stopLossPrice,
  showTakeProfit,
  takeProfitPrice,
}: PriceValidationProps): PriceValidationResult => {
  const isShort = currentTradeDirection === 'short'

  const validationResult = useMemo(() => {
    if (!currentPrice) {
      return {
        isValid: false,
        stopLossError: null,
        takeProfitError: null,
      }
    }

    const stopLossError = showStopLoss
      ? validatePrice(isShort, currentPrice, stopLossPrice, 'Stop Loss')
      : null

    const takeProfitError = showTakeProfit
      ? validatePrice(isShort, currentPrice, takeProfitPrice, 'Take Profit')
      : null

    const hasValidStopLoss = !stopLossError && showStopLoss && !stopLossPrice.isZero()
    const hasValidTakeProfit = !takeProfitError && showTakeProfit && !takeProfitPrice.isZero()
    const isValid = hasValidStopLoss || hasValidTakeProfit

    return {
      isValid,
      stopLossError,
      takeProfitError,
    }
  }, [currentPrice, isShort, showStopLoss, stopLossPrice, showTakeProfit, takeProfitPrice])

  return validationResult
}

export default usePriceValidation
