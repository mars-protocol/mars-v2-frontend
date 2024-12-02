import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import AssetAmountInput from 'components/common/AssetAmountInput'
import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import LeverageSlider from 'components/common/LeverageSlider'
import LimitPriceInput from 'components/common/LimitPriceInput'
import OrderTypeSelector from 'components/common/OrderTypeSelector'
import SwitchWithLabel from 'components/common/Switch/SwitchWithLabel'
import Text from 'components/common/Text'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import KeeperFee from 'components/perps/Module/KeeperFee'
import { LeverageButtons } from 'components/perps/Module/LeverageButtons'
import { Or } from 'components/perps/Module/Or'
import PerpsSummary from 'components/perps/Module/Summary'
import {
  DEFAULT_LIMIT_PRICE_INFO,
  DEFAULT_STOP_PRICE_INFO,
  PERPS_ORDER_TYPE_TABS,
} from 'components/perps/Module/constants'
import usePerpsModule from 'components/perps/Module/usePerpsModule'
import AssetSelectorPerps from 'components/trade/TradeModule/AssetSelector/AssetSelectorPerps'
import { BN_ONE, BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useAssets from 'hooks/assets/useAssets'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { usePerpsOrderForm } from 'hooks/perps/usePerpsOrderForm'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { OrderType } from 'types/enums'
import { byDenom } from 'utils/array'
import getPerpsPosition from 'utils/getPerpsPosition'
import { BN, capitalizeFirstLetter } from 'utils/helpers'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import usePerpsMarketState from 'hooks/perps/usePerpsMarketState'

export function PerpsModule() {
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const [stopTradeDirection, setStopTradeDirection] = useState<TradeDirection>('long')

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

  const perpsMarket = usePerpsMarketState()
  const params = usePerpsParams(perpsAsset?.denom)

  const calculateOpenInterestLeft = (
    oiValue: BigNumber | string | undefined,
    maxOi: BigNumber | string | undefined,
  ) => {
    const oiUsd = BN(oiValue ?? '0').shiftedBy(-PRICE_ORACLE_DECIMALS)
    const maxOiUsd = BN(maxOi ?? '0').shiftedBy(-PRICE_ORACLE_DECIMALS)
    return maxOiUsd.minus(oiUsd).div(perpsAsset?.price?.amount ?? BN_ONE)
  }

  const long_open_interest_left = calculateOpenInterestLeft(
    perpsMarket?.long_oi_value,
    params?.maxOpenInterestLong,
  )

  const short_open_interest_left = calculateOpenInterestLeft(
    perpsMarket?.short_oi_value,
    params?.maxOpenInterestShort,
  )

  const [stopPriceInfo, setStopPriceInfo] = useState<CallOut | undefined>(DEFAULT_STOP_PRICE_INFO)

  const isStopOrder = selectedOrderType === OrderType.STOP

  const { limitPrice, setLimitPrice, setStopPrice, orderType, stopPrice } = usePerpsOrderForm()

  useEffect(() => {
    if (!isStopOrder) {
      setStopPrice(BN_ZERO)
    }
  }, [isStopOrder, setStopPrice])

  useEffect(() => {
    if (orderType === 'limit') {
      setSelectedOrderType(OrderType.LIMIT)
    }
    if (orderType === 'stop') {
      setSelectedOrderType(OrderType.STOP)
    }
  }, [orderType])

  const [isReduceOnly, setIsReduceOnly] = useState(false)
  const [reduceOnlyWarning, setReduceOnlyWarning] = useState<string | null>(null)

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
  } = usePerpsModule(
    tradeDirection,
    isLimitOrder ? limitPrice : null,
    isStopOrder,
    stopTradeDirection,
  )

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
    } else {
      setReduceOnlyWarning(null)
    }

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
      setStopPrice(BN_ZERO)
      setSelectedOrderType(orderType)
      setIsReduceOnly(false)
      simulatePerps(currentPerpPosition, isAutoLendEnabledForCurrentAccount)
    },
    [
      updateAmount,
      setLimitPrice,
      setStopPrice,
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
    [updateAmount, setStopPrice],
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

  const calculateStopPriceInfo = useCallback(() => {
    if (!perpsAsset) return DEFAULT_STOP_PRICE_INFO
    if (stopPrice.isZero()) return DEFAULT_STOP_PRICE_INFO
    if (!perpsAsset.price) return undefined

    if (
      (stopTradeDirection === 'long' && stopPrice.isLessThanOrEqualTo(perpsAsset.price.amount)) ||
      (stopTradeDirection === 'short' && stopPrice.isGreaterThanOrEqualTo(perpsAsset.price.amount))
    ) {
      const aboveOrBelow = stopTradeDirection === 'long' ? 'below' : 'above'
      return {
        message: `You can not create a ${capitalizeFirstLetter(stopTradeDirection)} Stop order, ${aboveOrBelow} the current ${perpsAsset.symbol} price.`,
        type: CalloutType.WARNING,
      }
    }

    return undefined
  }, [stopPrice, perpsAsset, stopTradeDirection])

  const newLimitPriceInfo = useMemo(() => calculateLimitPriceInfo(), [calculateLimitPriceInfo])
  const newStopPriceInfo = useMemo(() => calculateStopPriceInfo(), [calculateStopPriceInfo])

  useEffect(() => {
    setLimitPriceInfo(newLimitPriceInfo)
  }, [newLimitPriceInfo])

  useEffect(() => {
    setStopPriceInfo(newStopPriceInfo)
  }, [newStopPriceInfo])

  useEffect(() => {
    if (!tradingFee || !perpsVault || perpsVaultModal) return
    if (isLimitOrder || isStopOrder) return

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
    isStopOrder,
    limitPrice,
    stopPrice,
    stopTradeDirection,
    perpsAsset,
    perpsVault,
    perpsVaultModal,
    simulatePerps,
    tradingFee,
  ])

  const isDisabledExecution = useMemo(() => {
    const baseConditions =
      amount.isZero() || amount.isGreaterThan(maxAmount) || warningMessages.isNotEmpty()

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

  const handleClosing = useCallback(() => {
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
  }, [currentPerpPosition, isStopOrder, stopTradeDirection, tradeDirection, updateAmount])

  const effectiveLeverage = useMemo(() => {
    if (amount.isGreaterThan(maxAmount)) {
      return maxLeverage
    }
    return Math.max(leverage, 0)
  }, [amount, maxAmount, leverage, maxLeverage])

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
        {isStopOrder ? (
          <TradeDirectionSelector
            direction={stopTradeDirection}
            onChangeDirection={onChangeStopTradeDirection}
          />
        ) : (
          <TradeDirectionSelector
            direction={tradeDirection}
            onChangeDirection={onChangeTradeDirection}
          />
        )}
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
        {isStopOrder && USD && (
          <>
            <LimitPriceInput
              asset={USD}
              amount={stopPrice}
              setAmount={setStopPrice}
              disabled={false}
              label='Stop Price'
            />
            {stopPriceInfo && <Callout type={stopPriceInfo.type}>{stopPriceInfo.message}</Callout>}
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
            !!currentPerpPosition &&
            (isStopOrder
              ? currentPerpPosition.tradeDirection !== stopTradeDirection
              : currentPerpPosition.tradeDirection !== tradeDirection)
          }
          isMaxSelected={isMaxSelected}
          capMax={false}
        />
        {isAmountExceedingMax && (
          <Callout type={CalloutType.WARNING}>
            The entered amount exceeds the maximum allowed.
          </Callout>
        )}
        {perpsMarket && params && perpsAsset && perpsAsset.price && (
          <div className='flex items-center gap-1 pb-2 text-xs text-white/60'>
            <span>Open Interest left ({isStopOrder ? stopTradeDirection : tradeDirection}):</span>
            <FormattedNumber
              amount={
                tradeDirection === 'short' || stopTradeDirection === 'short'
                  ? short_open_interest_left.toNumber()
                  : long_open_interest_left.toNumber()
              }
              options={{
                suffix: ` ${perpsAsset.symbol}`,
                abbreviated: true,
              }}
            />
          </div>
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
              disabled={isDisabledAmountInput}
            />
            {maxLeverage > 5 && (
              <LeverageButtons
                maxLeverage={maxLeverage}
                currentLeverage={effectiveLeverage}
                maxAmount={maxAmount}
                onChange={onChangeLeverage}
              />
            )}
          </div>
        )}
        {warningMessages.value.map((message) => (
          <Callout key={message} type={CalloutType.WARNING}>
            {message}
          </Callout>
        ))}
        {currentPerpPosition && (isLimitOrder || isStopOrder) && (
          <>
            <Divider />
            <SwitchWithLabel
              name='reduce-only'
              label='Reduce Only'
              value={isReduceOnly}
              onChange={() => setIsReduceOnly(!isReduceOnly)}
              tooltip={
                isStopOrder
                  ? "Use 'Reduce Only' for stop orders to ensure the order only reduces or closes your position."
                  : "Use 'Reduce Only' for limit orders to decrease your position. It prevents new position creation if the existing one is modified or closed."
              }
            />
            {reduceOnlyWarning && <Callout type={CalloutType.WARNING}>{reduceOnlyWarning}</Callout>}
          </>
        )}
      </div>
      <div className='flex flex-wrap w-full gap-4 mt-4'>
        {(isLimitOrder || isStopOrder) && <KeeperFee />}
        <PerpsSummary
          amount={amount}
          tradeDirection={isStopOrder ? stopTradeDirection : tradeDirection}
          asset={perpsAsset}
          leverage={effectiveLeverage}
          previousAmount={previousAmount}
          previousTradeDirection={previousTradeDirection}
          previousLeverage={previousLeverage}
          hasActivePosition={hasActivePosition}
          onTxExecuted={() => {
            updateAmount(BN_ZERO)
            simulatePerps(currentPerpPosition, isAutoLendEnabledForCurrentAccount)
          }}
          disabled={isDisabledExecution}
          orderType={selectedOrderType}
          limitPrice={isLimitOrder ? limitPrice : BN_ZERO}
          stopPrice={isStopOrder ? stopPrice : BN_ZERO}
          baseDenom={tradingFee?.baseDenom ?? ''}
          isReduceOnly={isReduceOnly}
          validateReduceOnlyOrder={validateReduceOnlyOrder}
        />
      </div>
    </Card>
  )
}
