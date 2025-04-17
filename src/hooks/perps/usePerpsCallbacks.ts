import { useCallback, useEffect, useRef } from 'react'
import { BigNumber } from 'bignumber.js'
import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
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
  simulatePerps: (position: PerpsPosition, isAutoLend: boolean) => void
  currentPerpPosition?: PerpsPosition
  isAutoLendEnabledForCurrentAccount: boolean
  isStopOrder: boolean
  stopTradeDirection: TradeDirection
  tradeDirection: TradeDirection
  maxLeverage: number
  perpsAsset: Asset
  setIsAmountInUSD: (value: boolean) => void
  isAmountInUSD: boolean
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
  perpsAsset,
  setIsAmountInUSD,
  isAmountInUSD,
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
      if (currentPerpPosition) {
        simulatePerps(currentPerpPosition, isAutoLendEnabledForCurrentAccount)
      }
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

  const assetPrice = perpsAsset?.price?.amount || BN_ZERO

  const handleAmountTypeChange = useCallback(
    (value: string) => {
      onChangeAmount(BN_ZERO)
      setIsAmountInUSD(value === 'usd')
    },
    [onChangeAmount, setIsAmountInUSD],
  )

  const previousInputMode = useRef(isAmountInUSD)

  useEffect(() => {
    if (previousInputMode.current !== isAmountInUSD) {
      onChangeAmount(BN_ZERO)
      previousInputMode.current = isAmountInUSD
    }
  }, [isAmountInUSD, onChangeAmount])

  const handleAmountChange = useCallback(
    (newAmount: BigNumber) => {
      try {
        if (isAmountInUSD && !assetPrice.isZero()) {
          if (newAmount.isNaN()) {
            onChangeAmount(BN_ZERO)
            return
          }

          const assetAmount = newAmount
            .shiftedBy(perpsAsset.decimals - PRICE_ORACLE_DECIMALS)
            .dividedBy(assetPrice)
            .integerValue(BigNumber.ROUND_DOWN)
          onChangeAmount(tradeDirection === 'long' ? assetAmount : assetAmount.negated())
        } else {
          if (newAmount.isNaN()) {
            onChangeAmount(BN_ZERO)
            return
          }

          const integerAmount = newAmount.integerValue(BigNumber.ROUND_DOWN)

          onChangeAmount(integerAmount)
        }
      } catch (error) {
        console.error('Error in handleAmountChange:', error)
        onChangeAmount(BN_ZERO)
      }
    },
    [isAmountInUSD, assetPrice, perpsAsset.decimals, onChangeAmount, tradeDirection],
  )

  const convertToDisplayAmount = useCallback(
    (assetAmount: BigNumber) => {
      try {
        if (isAmountInUSD && !assetPrice.isZero()) {
          return assetAmount
            .abs()
            .times(assetPrice)
            .shiftedBy(-perpsAsset.decimals + PRICE_ORACLE_DECIMALS)
        }

        return assetAmount.abs()
      } catch (error) {
        console.error('Error in convertToDisplayAmount:', error)
        return BN_ZERO
      }
    },
    [isAmountInUSD, assetPrice, perpsAsset.decimals],
  )

  const convertToDisplayMaxAmount = useCallback(
    (assetMaxAmount: BigNumber) => {
      try {
        if (isAmountInUSD && !assetPrice.isZero()) {
          return assetMaxAmount
            .times(assetPrice)
            .shiftedBy(-perpsAsset.decimals + PRICE_ORACLE_DECIMALS)
        }

        return assetMaxAmount
      } catch (error) {
        console.error('Error in convertToDisplayMaxAmount:', error)
        return BN_ZERO
      }
    },
    [isAmountInUSD, assetPrice, perpsAsset.decimals],
  )

  return {
    reset,
    onChangeTradeDirection,
    onChangeOrderType,
    onChangeStopTradeDirection,
    onChangeLeverage,
    handleAmountTypeChange,
    handleAmountChange,
    convertToDisplayAmount,
    convertToDisplayMaxAmount,
  }
}
