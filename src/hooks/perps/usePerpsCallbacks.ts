import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { OrderType } from 'types/enums'
import useStore from 'store'

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

const getDirectionalAmount = (amount: BigNumber, direction: TradeDirection) =>
  direction === 'long' ? amount : amount.negated()

const calculateAssetAmount = (usdAmount: BigNumber, assetPrice: BigNumber, decimals: number) =>
  usdAmount
    .shiftedBy(decimals - PRICE_ORACLE_DECIMALS)
    .dividedBy(assetPrice)
    .integerValue(BigNumber.ROUND_DOWN)

const calculateUsdAmount = (assetAmount: BigNumber, assetPrice: BigNumber, decimals: number) =>
  assetAmount
    .abs()
    .times(assetPrice)
    .shiftedBy(-decimals + PRICE_ORACLE_DECIMALS)

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
  const [storedUsdValue, setStoredUsdValue] = useState<BigNumber | null>(null)
  const assetPrice = perpsAsset?.price?.amount || BN_ZERO

  const onChangeAmount = useCallback(
    (newAmount: BigNumber) => {
      updateAmount(getDirectionalAmount(newAmount, tradeDirection))
    },
    [tradeDirection, updateAmount],
  )

  useEffect(() => {
    if (isAmountInUSD && !assetPrice.isZero() && storedUsdValue) {
      const newAssetAmount = calculateAssetAmount(storedUsdValue, assetPrice, perpsAsset.decimals)
      onChangeAmount(
        getDirectionalAmount(newAssetAmount, isStopOrder ? stopTradeDirection : tradeDirection),
      )
    }
  }, [
    assetPrice,
    isAmountInUSD,
    perpsAsset.decimals,
    storedUsdValue,
    onChangeAmount,
    isStopOrder,
    stopTradeDirection,
    tradeDirection,
  ])

  const handleAmountChange = useCallback(
    (newAmount: BigNumber) => {
      if (newAmount.isNaN() || newAmount.isZero()) {
        onChangeAmount(BN_ZERO)
        setStoredUsdValue(null)
        return
      }

      if (isAmountInUSD && !assetPrice.isZero()) {
        setStoredUsdValue(newAmount)
        const assetAmount = calculateAssetAmount(newAmount, assetPrice, perpsAsset.decimals)
        onChangeAmount(
          getDirectionalAmount(assetAmount, isStopOrder ? stopTradeDirection : tradeDirection),
        )
      } else {
        onChangeAmount(newAmount.integerValue(BigNumber.ROUND_DOWN))
        setStoredUsdValue(null)
      }
    },
    [
      isAmountInUSD,
      assetPrice,
      perpsAsset.decimals,
      onChangeAmount,
      isStopOrder,
      stopTradeDirection,
      tradeDirection,
    ],
  )

  const convertToDisplayAmount = useCallback(
    (assetAmount: BigNumber) => {
      if (isAmountInUSD && !assetPrice.isZero()) {
        return storedUsdValue || calculateUsdAmount(assetAmount, assetPrice, perpsAsset.decimals)
      }
      return assetAmount.abs()
    },
    [isAmountInUSD, assetPrice, perpsAsset.decimals, storedUsdValue],
  )

  const reset = useCallback(() => {
    setLimitPrice(BN_ZERO)
    updateAmount(BN_ZERO)
    setStoredUsdValue(null)
    updateLeverage(0)
  }, [updateAmount, setLimitPrice, updateLeverage])

  const onChangeTradeDirection = useCallback(
    (newTradeDirection: TradeDirection) => {
      updateAmount(BN_ZERO)
      setStoredUsdValue(null)
      setTradeDirection(newTradeDirection)
      updateLeverage(0)
      setLimitPrice(BN_ZERO)
      setIsReduceOnly(false)
      useStore.setState({
        conditionalTriggerOrders: { sl: null, tp: null },
        perpsTradeDirection: newTradeDirection,
      })
    },
    [updateAmount, setLimitPrice, setTradeDirection, setIsReduceOnly, updateLeverage],
  )

  const onChangeOrderType = useCallback(
    (orderType: OrderType) => {
      updateAmount(BN_ZERO)
      setStoredUsdValue(null)
      setLimitPrice(BN_ZERO)
      setStopPrice(BN_ZERO)
      setSelectedOrderType(orderType)
      setIsReduceOnly(false)
      useStore.setState({ conditionalTriggerOrders: { sl: null, tp: null } })

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
      setStoredUsdValue(null)
      setStopPrice(BN_ZERO)
      setIsReduceOnly(false)
      useStore.setState({ conditionalTriggerOrders: { sl: null, tp: null } })
    },
    [updateAmount, setStopPrice, setStopTradeDirection, setIsReduceOnly],
  )

  const onChangeLeverage = useCallback(
    (newLeverage: number) => {
      updateLeverage(newLeverage)
      setIsMaxSelected(newLeverage === maxLeverage)
      if (isAmountInUSD) {
        // Clear stored USD value so that convertToDisplayAmount calculates it fresh from the new asset amount
        setStoredUsdValue(null)
        setTimeout(() => setIsAmountInUSD(true), 0)
      }
    },
    [
      updateLeverage,
      maxLeverage,
      setIsMaxSelected,
      setIsAmountInUSD,
      isAmountInUSD,
      setStoredUsdValue,
    ],
  )

  const handleAmountTypeChange = useCallback(
    (value: string) => {
      const isChangingToUSD = value === 'usd'

      if (isChangingToUSD && !amount.isZero() && !assetPrice.isZero()) {
        const usdValue = calculateUsdAmount(amount, assetPrice, perpsAsset.decimals)
        setStoredUsdValue(usdValue)
      } else if (!isChangingToUSD) {
        setStoredUsdValue(null)
      }

      setIsAmountInUSD(isChangingToUSD)
    },
    [setIsAmountInUSD, amount, assetPrice, perpsAsset.decimals],
  )

  const convertToDisplayMaxAmount = useCallback(
    (assetMaxAmount: BigNumber) => {
      if (isAmountInUSD && !assetPrice.isZero()) {
        return calculateUsdAmount(assetMaxAmount, assetPrice, perpsAsset.decimals)
      }
      return assetMaxAmount
    },
    [isAmountInUSD, assetPrice, perpsAsset.decimals],
  )

  const clearValues = useCallback(() => {
    updateAmount(BN_ZERO)
    setStoredUsdValue(null)
  }, [updateAmount])

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
    storedUsdValue,
    clearValues,
  }
}
