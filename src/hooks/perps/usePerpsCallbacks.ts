import { useCallback } from 'react'
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
  amount: BigNumber
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
  amount,
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

  const changeStopOrderAmount = useCallback(
    (newAmount: BigNumber) => {
      updateAmount(stopTradeDirection === 'short' ? newAmount.negated() : newAmount)
    },
    [stopTradeDirection, updateAmount],
  )

  const changeRegularOrderAmount = useCallback(
    (newAmount: BigNumber) => {
      updateAmount(tradeDirection === 'short' ? newAmount.negated() : newAmount)
    },
    [tradeDirection, updateAmount],
  )

  const onChangeAmount = useCallback(
    (newAmount: BigNumber) => {
      const handler = isStopOrder ? changeStopOrderAmount : changeRegularOrderAmount
      handler(newAmount)
    },
    [isStopOrder, changeStopOrderAmount, changeRegularOrderAmount],
  )

  const onChangeLeverage = useCallback(
    (newLeverage: number) => {
      updateLeverage(newLeverage)
      if (newLeverage === maxLeverage) {
        setIsMaxSelected(true)
      } else {
        setIsMaxSelected(false)
      }

      if (isAmountInUSD) {
        setTimeout(() => {
          setIsAmountInUSD(true)
        }, 0)
      }
    },
    [updateLeverage, maxLeverage, setIsMaxSelected, setIsAmountInUSD, isAmountInUSD],
  )

  const assetPrice = perpsAsset?.price?.amount || BN_ZERO

  const handleAmountTypeChange = useCallback(
    (value: string) => {
      const isChangingToUSD = value === 'usd'

      const safeAmount = amount || BN_ZERO

      if (safeAmount.isZero() || assetPrice.isZero()) {
        setIsAmountInUSD(isChangingToUSD)
        return
      }

      setIsAmountInUSD(isChangingToUSD)
    },
    [setIsAmountInUSD, amount, assetPrice],
  )

  const getDirectionalAmount = useCallback(
    (amount: BigNumber) => {
      if (isStopOrder) {
        return stopTradeDirection === 'long' ? amount : amount.negated()
      }
      return tradeDirection === 'long' ? amount : amount.negated()
    },
    [isStopOrder, stopTradeDirection, tradeDirection],
  )

  const handleAmountChange = useCallback(
    (newAmount: BigNumber) => {
      try {
        if (newAmount.isNaN()) {
          onChangeAmount(BN_ZERO)
          return
        }

        if (isAmountInUSD && !assetPrice.isZero()) {
          const assetAmount = newAmount
            .shiftedBy(perpsAsset.decimals - PRICE_ORACLE_DECIMALS)
            .dividedBy(assetPrice)
            .integerValue(BigNumber.ROUND_DOWN)

          onChangeAmount(getDirectionalAmount(assetAmount))
        } else {
          const integerAmount = newAmount.integerValue(BigNumber.ROUND_DOWN)
          onChangeAmount(integerAmount)
        }
      } catch (error) {
        console.error('Error in handleAmountChange:', error)
        onChangeAmount(BN_ZERO)
      }
    },
    [isAmountInUSD, assetPrice, perpsAsset.decimals, onChangeAmount, getDirectionalAmount],
  )

  const convertToDisplayAmount = useCallback(
    (assetAmount: BigNumber) => {
      try {
        if (isAmountInUSD && !assetPrice.isZero()) {
          const usdAmount = assetAmount
            .abs()
            .times(assetPrice)
            .shiftedBy(-perpsAsset.decimals + PRICE_ORACLE_DECIMALS)

          return usdAmount
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
