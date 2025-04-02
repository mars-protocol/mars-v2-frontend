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

export const validateStopLoss = (
  isShort: boolean,
  currentPrice: BigNumber,
  stopLossPrice: BigNumber,
): string | null => {
  if (!stopLossPrice.isZero()) {
    if (!isShort && stopLossPrice.isGreaterThanOrEqualTo(currentPrice)) {
      return 'Stop Loss price must be lower than the current price for long positions'
    }
    if (isShort && stopLossPrice.isLessThanOrEqualTo(currentPrice)) {
      return 'Stop Loss price must be higher than the current price for short positions'
    }
  }
  return null
}

export const validateTakeProfit = (
  isShort: boolean,
  currentPrice: BigNumber,
  takeProfitPrice: BigNumber,
): string | null => {
  if (!takeProfitPrice.isZero()) {
    if (!isShort && takeProfitPrice.isLessThanOrEqualTo(currentPrice)) {
      return 'Take Profit price must be higher than the current price for long positions'
    }
    if (isShort && takeProfitPrice.isGreaterThanOrEqualTo(currentPrice)) {
      return 'Take Profit price must be lower than the current price for short positions'
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
      ? validateStopLoss(isShort, currentPrice, stopLossPrice)
      : null

    const takeProfitError = showTakeProfit
      ? validateTakeProfit(isShort, currentPrice, takeProfitPrice)
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
