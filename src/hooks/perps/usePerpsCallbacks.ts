import { useCallback } from 'react'
import { BigNumber } from 'bignumber.js'
import { BN_ZERO } from 'constants/math'
import { OrderType } from 'types/enums'

interface PerpsCallbacksProps {
  updateAmount: (amount: BigNumber) => void
  setLimitPrice: (price: BigNumber) => void
  setStopPrice: (price: BigNumber) => void
  setTradeDirection: (direction: TradeDirection) => void
  setStopTradeDirection: (direction: TradeDirection) => void
  setSelectedOrderType: (type: OrderType) => void
  setIsReduceOnly: (value: boolean) => void
  setIsMaxSelected: (value: boolean) => void
  updateLeverage: (leverage: number) => void
  simulatePerps: (position: any, isAutoLend: boolean) => void
  currentPerpPosition: any
  isAutoLendEnabledForCurrentAccount: boolean
  isStopOrder: boolean
  stopTradeDirection: TradeDirection
  tradeDirection: TradeDirection
  maxLeverage: number
}

export const usePerpsCallbacks = ({
  updateAmount,
  setLimitPrice,
  setStopPrice,
  setTradeDirection,
  setStopTradeDirection,
  setSelectedOrderType,
  setIsReduceOnly,
  setIsMaxSelected,
  updateLeverage,
  simulatePerps,
  currentPerpPosition,
  isAutoLendEnabledForCurrentAccount,
  isStopOrder,
  stopTradeDirection,
  tradeDirection,
  maxLeverage,
}: PerpsCallbacksProps) => {
  const reset = useCallback(() => {
    setLimitPrice(BN_ZERO)
    updateAmount(BN_ZERO)
    updateLeverage(0)
  }, [updateAmount, setLimitPrice, updateLeverage])

  const onChangeTradeDirection = useCallback(
    (newTradeDirection: TradeDirection) => {
      updateAmount(BN_ZERO)
      setTradeDirection(newTradeDirection)
      updateLeverage(0)
      setLimitPrice(BN_ZERO)
      setIsReduceOnly(false)
    },
    [updateAmount, setLimitPrice, setTradeDirection, setIsReduceOnly, updateLeverage],
  )

  const onChangeOrderType = useCallback(
    (orderType: OrderType) => {
      updateAmount(BN_ZERO)
      setLimitPrice(BN_ZERO)
      setStopPrice(BN_ZERO)
      setSelectedOrderType(orderType)
      setIsReduceOnly(false)
      simulatePerps(currentPerpPosition, isAutoLendEnabledForCurrentAccount)
    },
    [
      updateAmount,
      setLimitPrice,
      setStopPrice,
      setSelectedOrderType,
      setIsReduceOnly,
      simulatePerps,
      currentPerpPosition,
      isAutoLendEnabledForCurrentAccount,
    ],
  )

  const onChangeStopTradeDirection = useCallback(
    (newDirection: TradeDirection) => {
      setStopTradeDirection(newDirection)
      updateAmount(BN_ZERO)
      setStopPrice(BN_ZERO)
      setIsReduceOnly(false)
    },
    [updateAmount, setStopPrice, setStopTradeDirection, setIsReduceOnly],
  )

  const onChangeAmount = useCallback(
    (newAmount: BigNumber) => {
      if (isStopOrder) {
        updateAmount(stopTradeDirection === 'short' ? newAmount.negated() : newAmount)
      } else {
        updateAmount(tradeDirection === 'short' ? newAmount.negated() : newAmount)
      }
    },
    [isStopOrder, stopTradeDirection, tradeDirection, updateAmount],
  )

  const onChangeLeverage = useCallback(
    (newLeverage: number) => {
      updateLeverage(newLeverage)
      if (newLeverage === maxLeverage) {
        setIsMaxSelected(true)
      } else {
        setIsMaxSelected(false)
      }
    },
    [updateLeverage, maxLeverage, setIsMaxSelected],
  )

  return {
    reset,
    onChangeTradeDirection,
    onChangeOrderType,
    onChangeStopTradeDirection,
    onChangeAmount,
    onChangeLeverage,
  }
}
