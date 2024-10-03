import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import AssetAmountInput from 'components/common/AssetAmountInput'
import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import OrderTypeSelector from 'components/common/OrderTypeSelector'
import Text from 'components/common/Text'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import { LeverageButtons } from 'components/perps/Module/LeverageButtons'
import { Or } from 'components/perps/Module/Or'
import PerpsSummary from 'components/perps/Module/Summary'
import KeeperFee from 'components/perps/Module/KeeperFee'
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
import { capitalizeFirstLetter } from 'utils/helpers'
import getPerpsPosition from 'utils/getPerpsPosition'
import LeverageSlider from 'components/common/LeverageSlider'

export function PerpsModule() {
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const { data: perpsVault } = usePerpsVault()
  const { perpsAsset } = usePerpsAsset()
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>(OrderType.MARKET)
  const account = useCurrentAccount()
  const { data: allAssets } = useAssets()
  const { simulatePerps } = useUpdatedAccount(account)
  const perpsVaultModal = useStore((s) => s.perpsVaultModal)
  const [limitPrice, setLimitPrice] = useState<BigNumber>(BN_ZERO)
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const isLimitOrder = selectedOrderType === OrderType.LIMIT

  const [limitPriceInfo, setLimitPriceInfo] = useState<CallOut | undefined>(
    DEFAULT_LIMIT_PRICE_INFO,
  )

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

  const reset = useCallback(() => {
    setLimitPrice(BN_ZERO)
    updateAmount(BN_ZERO)
  }, [updateAmount])

  const onChangeTradeDirection = useCallback(
    (newTradeDirection: TradeDirection) => {
      updateAmount(amount.times(-1))
      setTradeDirection(newTradeDirection)
      if (isLimitOrder) reset()
    },
    [amount, isLimitOrder, reset, updateAmount],
  )

  const onChangeOrderType = useCallback(
    (orderType: OrderType) => {
      reset()
      setSelectedOrderType(orderType)
    },
    [reset],
  )

  const onChangeAmount = useCallback(
    (newAmount: BigNumber) => {
      updateAmount(tradeDirection === 'long' ? newAmount : newAmount.negated())
      if (newAmount.isEqualTo(maxAmount)) {
        setIsMaxSelected(true)
      } else {
        setIsMaxSelected(false)
      }
    },
    [tradeDirection, updateAmount, maxAmount, setIsMaxSelected],
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
    if (!tradingFee || !perpsVault || isLimitOrder || perpsVaultModal) return

    const newPosition = getPerpsPosition(
      perpsVault.denom,
      perpsAsset,
      amount.plus(amount),
      tradeDirection,
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
    simulatePerps,
    tradeDirection,
    tradingFee,
  ])

  const isDisabledExecution = useMemo(() => {
    if (!isLimitOrder) return amount.isGreaterThan(maxAmount) || warningMessages.isNotEmpty()

    return (
      !!limitPriceInfo ||
      limitPrice.isZero() ||
      amount.isGreaterThan(maxAmount) ||
      warningMessages.isNotEmpty()
    )
  }, [isLimitOrder, amount, maxAmount, warningMessages, limitPriceInfo, limitPrice])

  const isDisabledAmountInput = useMemo(() => {
    if (!isLimitOrder) return false
    return limitPrice.isZero() || !!limitPriceInfo
  }, [limitPrice, limitPriceInfo, isLimitOrder])

  const handleClosing = useCallback(() => {
    if (currentPerpPosition) {
      if (tradeDirection === 'long') {
        updateAmount(currentPerpPosition.amount)
      } else {
        updateAmount(currentPerpPosition.amount.negated())
      }
    }
  }, [currentPerpPosition, tradeDirection, updateAmount])

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
        />
        {!hasActivePosition && (
          <div className='w-full'>
            <Or />
            <Text size='sm' className='mt-5 mb-2'>
              Position Leverage
            </Text>
            <LeverageSlider
              max={maxLeverage}
              value={Math.max(leverage, 0)}
              onChange={onChangeLeverage}
              type={tradeDirection}
              disabled={isDisabledAmountInput}
            />
            {maxLeverage > 5 && (
              <LeverageButtons
                maxLeverage={maxLeverage}
                currentLeverage={leverage}
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
        />
      </div>
    </Card>
  )
}
