import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import AssetAmountInput from 'components/common/AssetAmountInput'
import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import LeverageSlider from 'components/common/LeverageSlider'
import OrderTypeSelector from 'components/common/OrderTypeSelector'
import SwitchWithLabel from 'components/common/Switch/SwitchWithLabel'
import Text from 'components/common/Text'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import KeeperFee from 'components/perps/Module/KeeperFee'
import { LeverageButtons } from 'components/perps/Module/LeverageButtons'
import { Or } from 'components/perps/Module/Or'
import PerpsSummary from 'components/perps/Module/Summary'
import { DEFAULT_LIMIT_PRICE_INFO, PERPS_ORDER_TYPE_TABS } from 'components/perps/Module/constants'
import usePerpsModule from 'components/perps/Module/usePerpsModule'
import AssetSelectorPerps from 'components/trade/TradeModule/AssetSelector/AssetSelectorPerps'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useAssets from 'hooks/assets/useAssets'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { OrderType } from 'types/enums'
import { byDenom } from 'utils/array'
import getPerpsPosition from 'utils/getPerpsPosition'
import { capitalizeFirstLetter } from 'utils/helpers'
import { usePerpsOrderForm } from 'hooks/perps/usePerpsOrderForm'
import LimitPriceInput from 'components/common/LimitPriceInput'

export function PerpsModule() {
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const { data: perpsVault } = usePerpsVault()
  const { perpsAsset } = usePerpsAsset()
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>(OrderType.MARKET)
  const account = useCurrentAccount()
  const { data: allAssets } = useAssets()
  const { simulatePerps } = useUpdatedAccount(account)
  const perpsVaultModal = useStore((s) => s.perpsVaultModal)
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const isLimitOrder = selectedOrderType === OrderType.LIMIT
  const [limitPriceInfo, setLimitPriceInfo] = useState<CallOut | undefined>(
    DEFAULT_LIMIT_PRICE_INFO,
  )

  const { limitPrice, setLimitPrice, orderType } = usePerpsOrderForm()

  useEffect(() => {
    if (orderType === 'limit') {
      setSelectedOrderType(OrderType.LIMIT)
    }
  }, [orderType])

  const [isReduceOnly, setIsReduceOnly] = useState(false)
  const [reduceOnlyWarning, setReduceOnlyWarning] = useState<string | null>(null)

  useEffect(() => {
    setIsReduceOnly(selectedOrderType === OrderType.STOP)
  }, [selectedOrderType])

  const {
    maxLeverage,
    maxAmount,
    isMaxSelected,
    amount,
    leverage,
    warningMessages,
    hasActivePosition,
    updateAmount,
    updateLeverage,
    setIsMaxSelected,
    previousAmount,
    previousLeverage,
    previousTradeDirection,
  } = usePerpsModule(tradeDirection, isLimitOrder ? limitPrice : null)

  const USD = allAssets.find(byDenom('usd'))

  const { data: tradingFee } = useTradingFeeAndPrice(perpsAsset.denom, amount.plus(previousAmount))

  const currentPerpPosition = account?.perps.find(byDenom(perpsAsset.denom))

  const validateReduceOnlyOrder = useCallback(() => {
    if (!isReduceOnly || !currentPerpPosition) {
      setReduceOnlyWarning(null)
      return true
    }

    const isIncreasingPosition =
      (currentPerpPosition.tradeDirection === 'long' && amount.isGreaterThan(0)) ||
      (currentPerpPosition.tradeDirection === 'short' && amount.isLessThan(0))
    const isFlippingPosition =
      (currentPerpPosition.tradeDirection === 'long' && amount.isLessThan(0)) ||
      (currentPerpPosition.tradeDirection === 'short' && amount.isGreaterThan(0))

    if (
      isIncreasingPosition ||
      (isFlippingPosition && amount.abs().isGreaterThan(currentPerpPosition.amount.abs()))
    ) {
      setReduceOnlyWarning(
        'This order violates the Reduce-Only setting. Reduce-Only orders can only decrease your current position size or close it entirely. Please uncheck Reduce-Only or adjust your order size.',
      )
      return false
    }

    setReduceOnlyWarning(null)
    return true
  }, [isReduceOnly, currentPerpPosition, amount])

  useEffect(() => {
    validateReduceOnlyOrder()
  }, [validateReduceOnlyOrder, amount, isReduceOnly])

  const reset = useCallback(() => {
    setLimitPrice(BN_ZERO)
    updateAmount(BN_ZERO)
  }, [updateAmount, setLimitPrice])

  const onChangeTradeDirection = useCallback(
    (newTradeDirection: TradeDirection) => {
      updateAmount(BN_ZERO)
      setTradeDirection(newTradeDirection)
      setLimitPrice(BN_ZERO)
      setIsReduceOnly(false)
    },
    [updateAmount, setLimitPrice],
  )

  const onChangeOrderType = useCallback(
    (orderType: OrderType) => {
      updateAmount(BN_ZERO)
      setLimitPrice(BN_ZERO)
      setSelectedOrderType(orderType)
      setIsReduceOnly(false)
    },
    [updateAmount, setLimitPrice],
  )

  const onChangeAmount = useCallback(
    (newAmount: BigNumber) => {
      updateAmount(tradeDirection === 'long' ? newAmount : newAmount.negated())
    },
    [tradeDirection, updateAmount],
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

  const calculateLimitPriceInfo = useCallback(() => {
    if (!perpsAsset) return DEFAULT_LIMIT_PRICE_INFO
    if (limitPrice.isZero()) return DEFAULT_LIMIT_PRICE_INFO
    if (!perpsAsset.price) return undefined

    if (
      (limitPrice.isLessThanOrEqualTo(perpsAsset.price.amount) && tradeDirection === 'short') ||
      (limitPrice.isGreaterThanOrEqualTo(perpsAsset.price.amount) && tradeDirection === 'long')
    ) {
      const belowOrAbove = tradeDirection === 'short' ? 'below' : 'above'
      return {
        message: `You can not create a ${capitalizeFirstLetter(tradeDirection)} Limit order, ${belowOrAbove} the current ${perpsAsset.symbol} price.`,
        type: CalloutType.WARNING,
      }
    }

    return undefined
  }, [limitPrice, perpsAsset, tradeDirection])

  const newLimitPriceInfo = useMemo(() => calculateLimitPriceInfo(), [calculateLimitPriceInfo])

  useEffect(() => {
    setLimitPriceInfo(newLimitPriceInfo)
  }, [newLimitPriceInfo])

  useEffect(() => {
    if (!tradingFee || !perpsVault || perpsVaultModal) return
    if (isLimitOrder) {
      simulatePerps(currentPerpPosition, isAutoLendEnabledForCurrentAccount)
      return
    }
    const newAmount = currentPerpPosition?.amount.plus(amount) ?? amount
    const previousTradeDirection = currentPerpPosition?.amount.isLessThan(0) ? 'short' : 'long'
    const newTradeDirection = newAmount.isLessThan(0) ? 'short' : 'long'
    const updatedTradeDirection = newAmount.isZero() ? previousTradeDirection : newTradeDirection

    const newPosition = getPerpsPosition(
      perpsVault.denom,
      perpsAsset,
      newAmount,
      updatedTradeDirection,
      tradingFee,
      currentPerpPosition,
      limitPrice,
    )
    simulatePerps(newPosition, isAutoLendEnabledForCurrentAccount)
  }, [
    amount,
    currentPerpPosition,
    isAutoLendEnabledForCurrentAccount,
    isLimitOrder,
    limitPrice,
    perpsAsset,
    perpsVault,
    perpsVaultModal,
    simulatePerps,
    tradingFee,
  ])

  const isDisabledExecution = useMemo(() => {
    if (!isLimitOrder) {
      return (
        amount.isGreaterThan(maxAmount) ||
        amount.isZero() ||
        warningMessages.isNotEmpty() ||
        (isReduceOnly && !validateReduceOnlyOrder())
      )
    }

    return (
      !!limitPriceInfo ||
      limitPrice.isZero() ||
      amount.isZero() ||
      amount.isGreaterThan(maxAmount) ||
      warningMessages.isNotEmpty() ||
      (isReduceOnly && !validateReduceOnlyOrder())
    )
  }, [
    isLimitOrder,
    amount,
    maxAmount,
    warningMessages,
    limitPriceInfo,
    limitPrice,
    isReduceOnly,
    validateReduceOnlyOrder,
  ])

  const isDisabledAmountInput = useMemo(() => {
    if (!isLimitOrder) return false
    return limitPrice.isZero() || !!limitPriceInfo
  }, [limitPrice, limitPriceInfo, isLimitOrder])

  const handleClosing = useCallback(() => {
    if (currentPerpPosition) {
      if (tradeDirection === 'long') {
        updateAmount(currentPerpPosition.amount.abs())
      } else {
        updateAmount(currentPerpPosition.amount.negated())
      }
    }
  }, [currentPerpPosition, tradeDirection, updateAmount])

  const effectiveLeverage = useMemo(() => {
    if (amount.isGreaterThan(maxAmount)) {
      return 0
    }
    return Math.max(leverage, 0)
  }, [amount, maxAmount, leverage])

  const isAmountExceedingMax = useMemo(() => {
    return amount.isGreaterThan(maxAmount)
  }, [amount, maxAmount])

  if (!perpsAsset) return null

  return (
    <Card
      contentClassName='p-4 px-3 h-auto flex flex-grow flex-col justify-between h-full'
      title={
        <AssetSelectorPerps
          asset={perpsAsset}
          hasActivePosition={hasActivePosition}
          onAssetSelect={reset}
        />
      }
      className={classNames(
        'mb-4 md:mb-0',
        'md:min-h-[850px]',
        'relative isolate overflow-hidden rounded-base z-30',
      )}
    >
      <div className='flex flex-col gap-5'>
        <OrderTypeSelector
          orderTabs={PERPS_ORDER_TYPE_TABS}
          selected={selectedOrderType}
          onChange={onChangeOrderType}
        />
        <TradeDirectionSelector
          direction={tradeDirection}
          onChangeDirection={onChangeTradeDirection}
        />

        {isLimitOrder && USD && (
          <>
            <LimitPriceInput
              asset={USD}
              label='Limit Price'
              amount={limitPrice}
              setAmount={setLimitPrice}
              disabled={false}
            />
            {limitPriceInfo && (
              <Callout type={limitPriceInfo.type}>{limitPriceInfo.message}</Callout>
            )}
            <Divider />
          </>
        )}
        <AssetAmountInput
          containerClassName='pb-2'
          label='Amount'
          max={maxAmount}
          amount={amount.abs()}
          setAmount={onChangeAmount}
          asset={perpsAsset}
          maxButtonLabel='Max:'
          disabled={isDisabledAmountInput}
          onClosing={handleClosing}
          showCloseButton={
            !!currentPerpPosition && currentPerpPosition.tradeDirection !== tradeDirection
          }
          isMaxSelected={isMaxSelected}
          capMax={false}
        />
        {isAmountExceedingMax && (
          <Callout type={CalloutType.WARNING}>
            The entered amount exceeds the maximum allowed.
          </Callout>
        )}
        {!maxAmount.isZero() && !currentPerpPosition && (
          <div className='w-full'>
            <Or />
            <Text size='sm' className='mt-5 mb-2'>
              Position Leverage
            </Text>
            <LeverageSlider
              max={maxLeverage}
              value={effectiveLeverage}
              onChange={onChangeLeverage}
              type={tradeDirection}
              disabled={isDisabledAmountInput || amount.isGreaterThan(maxAmount)}
            />
            {maxLeverage > 5 && (
              <LeverageButtons
                maxLeverage={maxLeverage}
                currentLeverage={effectiveLeverage}
                maxAmount={maxAmount}
                onChange={onChangeLeverage}
                // disabled={amount.isGreaterThan(maxAmount)}
              />
            )}
          </div>
        )}
        {warningMessages.value.map((message) => (
          <Callout key={message} type={CalloutType.WARNING}>
            {message}
          </Callout>
        ))}
        {currentPerpPosition && isLimitOrder && (
          <>
            <Divider />
            <SwitchWithLabel
              name='reduce-only'
              label='Reduce Only'
              value={isReduceOnly}
              onChange={() => setIsReduceOnly(!isReduceOnly)}
              tooltip="Use 'Reduce Only' for limit orders to decrease your position. It prevents new position creation if the existing one is modified or closed."
            />
            {reduceOnlyWarning && <Callout type={CalloutType.WARNING}>{reduceOnlyWarning}</Callout>}
          </>
        )}
      </div>
      <div className='flex flex-wrap w-full gap-4 mt-4'>
        {isLimitOrder && <KeeperFee />}
        <PerpsSummary
          amount={amount}
          tradeDirection={tradeDirection}
          asset={perpsAsset}
          leverage={leverage}
          previousAmount={previousAmount}
          previousTradeDirection={previousTradeDirection}
          previousLeverage={previousLeverage}
          hasActivePosition={hasActivePosition}
          onTxExecuted={() => updateAmount(BN_ZERO)}
          disabled={isDisabledExecution}
          baseDenom={tradingFee?.baseDenom ?? ''}
          limitPrice={limitPrice}
          orderType={selectedOrderType}
          isReduceOnly={isReduceOnly}
          validateReduceOnlyOrder={validateReduceOnlyOrder}
        />
      </div>
    </Card>
  )
}
