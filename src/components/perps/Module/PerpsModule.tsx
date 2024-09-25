import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import AssetAmountInput from 'components/common/AssetAmountInput'
import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import LeverageSlider from 'components/common/LeverageSlider'
import OrderTypeSelector from 'components/common/OrderTypeSelector'
import Text from 'components/common/Text'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import { LeverageButtons } from 'components/perps/Module/LeverageButtons'
import { Or } from 'components/perps/Module/Or'
import PerpsSummary from 'components/perps/Module/Summary'
import TakerFee from 'components/perps/Module/TakerFee'
import { DEFAULT_LIMIT_PRICE_INFO, PERPS_ORDER_TYPE_TABS } from 'components/perps/Module/constants'
import usePerpsModule from 'components/perps/Module/usePerpsModule'
import AssetSelectorPerps from 'components/trade/TradeModule/AssetSelector/AssetSelectorPerps'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { OrderType } from 'types/enums'
import { getAccountNetValue } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { demagnify, getCoinValue } from 'utils/formatters'
import getPerpsPosition from 'utils/getPerpsPosition'
import { BN, capitalizeFirstLetter } from 'utils/helpers'

export function PerpsModule() {
  const chainConfig = useChainConfig()
  const [takerFee, _] = useLocalStorage(
    LocalStorageKeys.PERPS_TAKER_FEE,
    getDefaultChainSettings(chainConfig).perpsTakerFee,
  )
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const { data: perpsVault } = usePerpsVault()
  const { perpsAsset } = usePerpsAsset()
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>(OrderType.MARKET)
  const account = useCurrentAccount()
  const { data: allAssets } = useAssets()
  const { simulatePerps } = useUpdatedAccount(account)
  const [amount, setAmount] = useState<BigNumber>(BN_ZERO)
  const perpsVaultModal = useStore((s) => s.perpsVaultModal)
  const [limitPrice, setLimitPrice] = useState<BigNumber>(BN_ZERO)
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const {
    warningMessages,
    previousAmount,
    previousTradeDirection,
    previousLeverage,
    leverage,
    hasActivePosition,
  } = usePerpsModule(amount, limitPrice)

  const [sliderLeverage, setSliderLeverage] = useState<number>(1)
  const [limitPriceInfo, setLimitPriceInfo] = useState<CallOut | undefined>(
    DEFAULT_LIMIT_PRICE_INFO,
  )

  const isLimitOrder = selectedOrderType === OrderType.LIMIT
  const USD = allAssets.find(byDenom('usd'))
  const { computeMaxPerpAmount } = useHealthComputer(account)

  const { data: tradingFee } = useTradingFeeAndPrice(perpsAsset.denom, amount.plus(previousAmount))

  const currentPerpPosition = account?.perps.find(byDenom(perpsAsset.denom))

  const netValue = useMemo(() => {
    if (!account) return BN_ZERO

    return getAccountNetValue(account, allAssets)
  }, [account, allAssets])

  const maxAmount = useMemo(() => {
    let maxAmount = computeMaxPerpAmount(perpsAsset.denom, tradeDirection)

    if (tradeDirection === 'short') maxAmount = maxAmount.plus(previousAmount)
    if (tradeDirection === 'long') maxAmount = maxAmount.minus(previousAmount)

    return maxAmount
  }, [computeMaxPerpAmount, perpsAsset, previousAmount, tradeDirection])

  const maxAmountLimitOrder = useMemo(() => {
    if (limitPrice.isZero() || limitPriceInfo) return BN_ZERO
    const maxAmountValue = getCoinValue(BNCoin.fromDenomAndBigNumber(perpsAsset.denom, maxAmount), [
      perpsAsset,
    ])
    return maxAmountValue.dividedBy(limitPrice).shiftedBy(perpsAsset.decimals)
  }, [limitPrice, limitPriceInfo, perpsAsset, maxAmount])

  const currentMaxAmount = useMemo(() => {
    return isLimitOrder ? maxAmountLimitOrder : maxAmount
  }, [isLimitOrder, maxAmountLimitOrder, maxAmount])

  const maxLeverage = useMemo(() => {
    let maxLeverage = 1
    const priceToUse = isLimitOrder ? limitPrice : (perpsAsset.price?.amount ?? BN_ZERO)
    if (!hasActivePosition) {
      maxLeverage = priceToUse
        .times(demagnify(currentMaxAmount, perpsAsset))
        .div(netValue)
        .plus(1)
        .toNumber()
    }

    return maxLeverage
  }, [hasActivePosition, currentMaxAmount, perpsAsset, netValue, isLimitOrder, limitPrice])

  const reset = useCallback(() => {
    setLimitPrice(BN_ZERO)
    setAmount(BN_ZERO)
    setSliderLeverage(1)
  }, [])

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
      const newLeverage = percentOfMax.times(maxLeverage).plus(1).toNumber()
      setSliderLeverage(Math.max(newLeverage, 1))
      if (tradeDirection === 'short') {
        setAmount(amount.times(-1))
        return
      }

      setAmount(amount)
    },
    [currentMaxAmount, maxLeverage, tradeDirection],
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
    if (!tradingFee || !perpsVault || isLimitOrder || perpsVaultModal) return

    const newPosition = getPerpsPosition(
      perpsVault.denom,
      perpsAsset,
      amount.plus(previousAmount),
      tradeDirection ?? previousTradeDirection,
      tradingFee,
      currentPerpPosition,
    )
    if (newPosition) simulatePerps(newPosition, isAutoLendEnabledForCurrentAccount)
  }, [
    amount,
    currentPerpPosition,
    isAutoLendEnabledForCurrentAccount,
    isLimitOrder,
    perpsAsset,
    perpsVault,
    perpsVaultModal,
    previousAmount,
    previousTradeDirection,
    simulatePerps,
    tradeDirection,
    tradingFee,
  ])

  const isDisabledExecution = useMemo(() => {
    if (!isLimitOrder) return amount.isGreaterThan(currentMaxAmount) || warningMessages.isNotEmpty()

    return (
      !!limitPriceInfo ||
      limitPrice.isZero() ||
      amount.isGreaterThan(currentMaxAmount) ||
      warningMessages.isNotEmpty()
    )
  }, [isLimitOrder, amount, currentMaxAmount, warningMessages, limitPriceInfo, limitPrice])

  const isDisabledAmountInput = useMemo(() => {
    if (!isLimitOrder) return false
    return limitPrice.isZero() || !!limitPriceInfo
  }, [limitPrice, limitPriceInfo, isLimitOrder])

  const onChangeLeverage = useCallback(
    (newLeverage: number) => {
      setSliderLeverage(newLeverage)

      if (currentMaxAmount.isZero() || netValue.isZero()) return
      const priceToUse = isLimitOrder ? limitPrice : (perpsAsset.price?.amount ?? BN_ZERO)
      if (priceToUse.isZero()) return

      let newAmount: BigNumber
      if (newLeverage === 1) {
        newAmount = netValue.times(newLeverage).dividedBy(limitPrice)
        console.log('newLeverage is ', newLeverage, newAmount.toString())
      } else {
        newAmount = netValue.times(newLeverage).dividedBy(priceToUse)
      }
      console.log('newAmount', newAmount.toString())
      newAmount = newAmount.shiftedBy(perpsAsset.decimals)
      const finalAmount = BigNumber.min(newAmount, currentMaxAmount).integerValue()

      setAmount(finalAmount)
    },
    [currentMaxAmount, netValue, isLimitOrder, limitPrice, perpsAsset.price, perpsAsset.decimals],
  )

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
          containerClassName='pb-2'
          label='Amount'
          max={currentMaxAmount}
          amount={amount.abs()}
          setAmount={onChangeAmount}
          asset={perpsAsset}
          maxButtonLabel='Max:'
          disabled={isDisabledAmountInput}
          onMaxClick={() => setAmount(currentMaxAmount)}
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
              onChange={onChangeLeverage}
              type={tradeDirection}
              disabled={isDisabledAmountInput}
            />
            {maxLeverage > 5 && (
              <LeverageButtons
                maxLeverage={maxLeverage}
                currentLeverage={sliderLeverage}
                maxAmount={currentMaxAmount}
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
      </div>
      <div className='flex flex-wrap w-full gap-4 mt-4'>
        {isLimitOrder && <TakerFee />}
        <PerpsSummary
          amount={amount ?? previousAmount}
          tradeDirection={tradeDirection ?? previousTradeDirection}
          asset={perpsAsset}
          leverage={leverage}
          previousAmount={previousAmount}
          previousTradeDirection={previousTradeDirection}
          previousLeverage={previousLeverage}
          hasActivePosition={hasActivePosition}
          onTxExecuted={() => setAmount(BN_ZERO)}
          disabled={isDisabledExecution}
          baseDenom={tradingFee?.baseDenom ?? ''}
          limitPrice={limitPrice}
          orderType={selectedOrderType}
        />
      </div>
    </Card>
  )
}
