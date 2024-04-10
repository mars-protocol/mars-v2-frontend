import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'

import AssetAmountInput from 'components/common/AssetAmountInput'
import { Callout } from 'components/common/Callout'
import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import LeverageSlider from 'components/common/LeverageSlider'
import OrderTypeSelector from 'components/common/OrderTypeSelector'
import Text from 'components/common/Text'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import { LeverageButtons } from 'components/perps/Module/LeverageButtons'
import MakerFee from 'components/perps/Module/MakerFee'
import { Or } from 'components/perps/Module/Or'
import PerpsSummary from 'components/perps/Module/Summary'
import { DEFAULT_LIMIT_PRICE_INFO, PERPS_ORDER_TYPE_TABS } from 'components/perps/Module/constants'
import usePerpsModule from 'components/perps/Module/usePerpsModule'
import AssetSelectorPerps from 'components/trade/TradeModule/AssetSelector/AssetSelectorPerps'
import USD from 'configs/assets/USDollar'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import useHealthComputer from 'hooks/useHealthComputer'
import usePrice from 'hooks/usePrice'
import usePrices from 'hooks/usePrices'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import { CalloutType } from 'types/enums/callOut'
import { OrderType } from 'types/enums/orderType'
import { getAccountNetValue } from 'utils/accounts'
import { demagnify } from 'utils/formatters'
import getPerpsPosition from 'utils/getPerpsPosition'
import { BN, capitalizeFirstLetter } from 'utils/helpers'

export function PerpsModule() {
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const { data: perpsVault } = usePerpsVault()
  const { perpsAsset } = usePerpsAsset()
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>(OrderType.MARKET)
  const account = useCurrentAccount()
  const { data: prices } = usePrices()
  const allAssets = useAllAssets()
  const { simulatePerps, updatedPerpPosition } = useUpdatedAccount(account)
  const [amount, setAmount] = useState<BigNumber>(BN_ZERO)
  const [limitPrice, setLimitPrice] = useState<BigNumber>(BN_ZERO)

  const {
    warningMessages,
    previousAmount,
    previousTradeDirection,
    previousLeverage,
    leverage,
    hasActivePosition,
  } = usePerpsModule(amount)

  const [sliderLeverage, setSliderLeverage] = useState<number>(1)
  const [limitPriceInfo, setLimitPriceInfo] = useState<CallOut | undefined>(
    DEFAULT_LIMIT_PRICE_INFO,
  )

  const isLimitOrder = selectedOrderType === OrderType.LIMIT

  const { computeMaxPerpAmount } = useHealthComputer(account)

  const { data: tradingFee } = useTradingFeeAndPrice(
    perpsAsset.denom,
    amount.plus(previousAmount),
    previousAmount,
  )
  const perpsOraclePrice = usePrice(perpsAsset.denom)
  const perpsParams = usePerpsParams(perpsAsset.denom)

  const debouncedUpdateAccount = useMemo(
    () =>
      debounce((perpsPosition: PerpsPosition) => {
        if (
          !!updatedPerpPosition &&
          perpsPosition.amount.isEqualTo(updatedPerpPosition.amount) &&
          perpsPosition.tradeDirection === updatedPerpPosition.tradeDirection
        )
          return

        simulatePerps(perpsPosition)
      }, 500),
    [simulatePerps, updatedPerpPosition],
  )

  useEffect(() => {
    const currentPerpPosition = account?.perps.find((p) => p.denom === perpsAsset.denom)
    if (!perpsParams || !tradingFee || !perpsVault) return

    const perpsPosition = getPerpsPosition(
      perpsVault.denom,
      perpsAsset,
      amount.plus(previousAmount),
      tradeDirection ?? previousTradeDirection,
      perpsParams,
      tradingFee,
      currentPerpPosition,
    )

    debouncedUpdateAccount(perpsPosition)
  }, [
    debouncedUpdateAccount,
    amount,
    perpsAsset,
    tradeDirection,
    previousAmount,
    previousTradeDirection,
    perpsParams,
    tradingFee,
    perpsVault,
    account?.perps,
    perpsOraclePrice,
  ])

  const netValue = useMemo(() => {
    if (!account) return BN_ZERO

    return getAccountNetValue(account, prices, allAssets)
  }, [account, allAssets, prices])

  const maxAmount = useMemo(() => {
    let maxAmount = computeMaxPerpAmount(perpsAsset.denom, tradeDirection)

    if (tradeDirection === 'short') maxAmount = maxAmount.plus(previousAmount)
    if (tradeDirection === 'long') maxAmount = maxAmount.minus(previousAmount)

    return (maxAmount = BigNumber.max(maxAmount, 2000000000))
  }, [computeMaxPerpAmount, perpsAsset, previousAmount, tradeDirection])

  const maxAmountLimitOrder = useMemo(() => {
    if (limitPrice.isZero() || limitPriceInfo) return BN_ZERO
    const maxAmountValue = maxAmount.times(perpsOraclePrice)
    return maxAmountValue.dividedBy(limitPrice)
  }, [perpsOraclePrice, limitPrice, maxAmount, limitPriceInfo])

  const currentMaxAmount = useMemo(() => {
    return isLimitOrder ? maxAmountLimitOrder : maxAmount
  }, [isLimitOrder, maxAmountLimitOrder, maxAmount])

  const maxLeverage = useMemo(() => {
    let maxLeverage = 1
    const priceToUse = isLimitOrder ? limitPrice : perpsOraclePrice
    if (!hasActivePosition) {
      maxLeverage = priceToUse
        .times(demagnify(currentMaxAmount, perpsAsset))
        .div(netValue)
        .plus(1)
        .toNumber()
    }

    return maxLeverage
  }, [
    hasActivePosition,
    perpsOraclePrice,
    currentMaxAmount,
    perpsAsset,
    netValue,
    isLimitOrder,
    limitPrice,
  ])

  const reset = useCallback(() => {
    setLimitPrice(BN_ZERO)
    setAmount(BN_ZERO)
    setSliderLeverage(1)
  }, [])

  const onDebounce = useCallback(() => {
    if (currentMaxAmount.isZero()) return
    const percentOfMax = BN(sliderLeverage).div(maxLeverage)
    setAmount(currentMaxAmount.times(percentOfMax).integerValue())
  }, [currentMaxAmount, maxLeverage, sliderLeverage])

  const onChangeTradeDirection = useCallback(
    (tradeDirection: TradeDirection) => {
      setAmount(amount.times(-1))
      setTradeDirection(tradeDirection)
      if (isLimitOrder) reset()
    },
    [amount, isLimitOrder, reset],
  )

  const onChangeOrderType = useCallback(
    (orderType: OrderType) => {
      reset()
      setSelectedOrderType(orderType)
    },
    [reset],
  )

  const onChangeAmount = useCallback(
    (amount: BigNumber) => {
      if (currentMaxAmount.isZero()) return
      const percentOfMax = BN(amount).div(currentMaxAmount)
      const newLeverage = percentOfMax
        .times(maxLeverage - 1)
        .plus(1)
        .toNumber()

      setSliderLeverage(Math.max(newLeverage, 1))
      if (tradeDirection === 'short') {
        setAmount(amount.times(-1))
        return
      }

      setAmount(amount)
    },
    [currentMaxAmount, maxLeverage, tradeDirection],
  )

  useEffect(() => {
    if (!prices || !perpsAsset) return
    if (limitPrice.isZero()) {
      setLimitPriceInfo(DEFAULT_LIMIT_PRICE_INFO)
      return
    }
    if (!perpsOraclePrice) return

    if (
      (limitPrice.isLessThanOrEqualTo(perpsOraclePrice) && tradeDirection === 'short') ||
      (limitPrice.isGreaterThanOrEqualTo(perpsOraclePrice) && tradeDirection === 'long')
    ) {
      const belowOrAbove = tradeDirection === 'short' ? 'below' : 'above'
      setLimitPriceInfo({
        message: `You can not create a ${capitalizeFirstLetter(tradeDirection)} Limit order, ${belowOrAbove} the current ${perpsAsset.symbol} price.`,
        type: CalloutType.WARNING,
      })
      return
    }
    if (limitPriceInfo) setLimitPriceInfo(undefined)

    return
  }, [
    limitPrice,
    prices,
    perpsAsset,
    limitPriceInfo,
    perpsOraclePrice,
    tradeDirection,
    perpsAsset.symbol,
  ])

  const isDisabledExecution = useMemo(() => {
    if (!isLimitOrder) return amount.isGreaterThan(currentMaxAmount) || warningMessages.isNotEmpty()

    return (
      !!limitPriceInfo ||
      limitPrice.isZero() ||
      amount.isGreaterThan(currentMaxAmount) ||
      warningMessages.isNotEmpty()
    )
  }, [amount, limitPriceInfo, limitPrice, currentMaxAmount, warningMessages, isLimitOrder])

  const isDisabledAmountInput = useMemo(() => {
    if (!isLimitOrder) return false
    return limitPrice.isZero() || !!limitPriceInfo
  }, [limitPrice, limitPriceInfo, isLimitOrder])

  if (!perpsAsset) return null

  return (
    <Card
      contentClassName='p-4 px-3 h-auto flex flex-grow flex-col justify-between h-full'
      title={<AssetSelectorPerps asset={perpsAsset} hasActivePosition={hasActivePosition} />}
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

        {isLimitOrder && (
          <>
            <AssetAmountInput
              asset={USD}
              label='Limit Price'
              amount={limitPrice}
              setAmount={setLimitPrice}
              disabled={false}
              isUSD
            />
            {limitPriceInfo && (
              <Callout type={limitPriceInfo.type}>{limitPriceInfo.message}</Callout>
            )}
            <Divider />
          </>
        )}
        <AssetAmountInput
          label='Amount'
          max={currentMaxAmount}
          amount={amount.abs()}
          setAmount={onChangeAmount}
          asset={perpsAsset}
          maxButtonLabel='Max:'
          disabled={isDisabledAmountInput}
        />
        {!hasActivePosition && (
          <div className='w-full'>
            <Or />
            <Text size='sm' className='mt-5 mb-2'>
              Position Leverage
            </Text>
            <LeverageSlider
              min={1}
              max={maxLeverage}
              value={sliderLeverage}
              onChange={setSliderLeverage}
              onDebounce={onDebounce}
              type={tradeDirection}
              disabled={isDisabledAmountInput}
            />
            {maxLeverage > 5 && (
              <LeverageButtons
                maxLeverage={maxLeverage}
                currentLeverage={leverage}
                maxAmount={currentMaxAmount}
                onChange={(leverage) => {
                  const percentOfMax = BN(leverage - 1).div(maxLeverage - 1)
                  setAmount(currentMaxAmount.times(percentOfMax).integerValue())
                  setSliderLeverage(leverage)
                }}
              />
            )}
          </div>
        )}
        {warningMessages.value.map((message) => (
          <Callout key={message} type={CalloutType.WARNING}>
            {message}
          </Callout>
        ))}
      </div>
      <div className='flex flex-wrap w-full gap-4 mt-4'>
        {isLimitOrder && <MakerFee />}
        <PerpsSummary
          amount={amount ?? previousAmount}
          tradeDirection={tradeDirection ?? previousTradeDirection}
          asset={perpsAsset}
          leverage={leverage}
          previousAmount={previousAmount}
          previousTradeDirection={previousTradeDirection}
          previousLeverage={previousLeverage}
          hasActivePosition={hasActivePosition}
          onTxExecuted={() => reset()}
          disabled={isDisabledExecution}
          limitPrice={limitPrice}
          orderType={selectedOrderType}
        />
      </div>
    </Card>
  )
}
