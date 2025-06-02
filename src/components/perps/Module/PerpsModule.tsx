import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import AssetAmountInput from 'components/common/AssetAmountInput'
import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import { FormattedNumber } from 'components/common/FormattedNumber'
import OrderTypeSelector from 'components/common/OrderTypeSelector'
import Text from 'components/common/Text'
import { PERPS_ORDER_TYPE_TABS } from 'components/perps/Module/constants'
import KeeperFee from 'components/perps/Module/KeeperFee'
import { LeverageSection } from 'components/perps/Module/LeverageSection'
import PerpsTradeDirectionSelector from 'components/perps/Module/PerpsTradeDirectionSelector'
import { LimitPriceSection, StopPriceSection } from 'components/perps/Module/PriceInputs'
import { ReduceOnlySwitch } from 'components/perps/Module/ReduceOnlySwitch'
import PerpsSummary from 'components/perps/Module/Summary'
import AssetSelectorPerps from 'components/trade/TradeModule/AssetSelector/AssetSelectorPerps'

import { BN_ZERO } from 'constants/math'
import useStore from 'store'
import { OrderType } from 'types/enums'
import { byDenom } from 'utils/array'

import ActionButton from 'components/common/Button/ActionButton'
import usePerpsModule from 'components/perps/Module/usePerpsModule'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useAssets from 'hooks/assets/useAssets'
import { useExecutionState } from 'hooks/perps/useExecutionState'
import { useHandleClosing } from 'hooks/perps/useHandleClosing'
import { useLimitPriceInfo } from 'hooks/perps/useLimitPriceInfo'
import { useOpenInterestLeft } from 'hooks/perps/useOpenInterestLeft'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { usePerpsCallbacks } from 'hooks/perps/usePerpsCallbacks'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import { usePerpsOrderForm } from 'hooks/perps/usePerpsOrderForm'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { usePositionSimulation } from 'hooks/perps/usePositionSimulation'
import { useReduceOnlyOrder } from 'hooks/perps/useReduceOnlyOrder'
import { useStopPriceInfo } from 'hooks/perps/useStopPriceInfo'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import useAutoLend from 'hooks/wallet/useAutoLend'
import { BNCoin } from 'types/classes/BNCoin'

export function PerpsModule() {
  // State declarations
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const [stopTradeDirection, setStopTradeDirection] = useState<TradeDirection>('long')
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>(OrderType.MARKET)
  const [isReduceOnly, setIsReduceOnly] = useState(false)

  // Derived state
  const isLimitOrder = selectedOrderType === OrderType.LIMIT
  const isStopOrder = selectedOrderType === OrderType.STOP

  // Custom hooks
  const { data: perpsVault } = usePerpsVault()
  const { perpsAsset } = usePerpsAsset()
  const account = useCurrentAccount()
  const { data: allAssets } = useAssets()
  const { simulatePerps } = useUpdatedAccount(account)
  const perpsVaultModal = useStore((s) => s.perpsVaultModal)
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()

  const { limitPrice, setLimitPrice, setStopPrice, orderType, stopPrice } = usePerpsOrderForm()
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
  const { data: tradingFee } = useTradingFeeAndPrice(perpsAsset.denom, amount.plus(previousAmount))

  // Custom price info hooks
  const limitPriceInfo = useLimitPriceInfo(limitPrice, perpsAsset, tradeDirection)
  const stopPriceInfo = useStopPriceInfo(stopPrice, perpsAsset, stopTradeDirection)

  //OI calc
  const { longOpenInterestLeft, shortOpenInterestLeft } = useOpenInterestLeft()

  // Derived data
  const USD = allAssets.find(byDenom('usd'))
  const currentPerpPosition = account?.perps.find(byDenom(perpsAsset.denom))

  // Order management hooks
  const { reduceOnlyWarning, validateReduceOnlyOrder } = useReduceOnlyOrder(
    isReduceOnly,
    currentPerpPosition,
    amount,
  )

  // Close position dependencies
  const currentAccount = useCurrentAccount()
  const { data: limitOrders } = usePerpsLimitOrders()
  const closePerpPosition = useStore((s) => s.closePerpPosition)

  const handleClosing = useHandleClosing(
    currentPerpPosition,
    isStopOrder,
    stopTradeDirection,
    tradeDirection,
    updateAmount,
    setIsReduceOnly,
  )

  // perp callbacks
  const {
    reset,
    onChangeTradeDirection,
    onChangeOrderType,
    onChangeStopTradeDirection,
    onChangeAmount,
    onChangeLeverage,
  } = usePerpsCallbacks({
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
  })

  const { isDisabledExecution, isDisabledAmountInput } = useExecutionState({
    amount,
    maxAmount,
    warningMessages: warningMessages.value,
    isStopOrder,
    stopPrice,
    stopTradeDirection,
    perpsAsset,
    isLimitOrder,
    limitPriceInfo,
    limitPrice,
  })

  usePositionSimulation({
    tradingFee,
    perpsVault,
    perpsVaultModal,
    isLimitOrder,
    isStopOrder,
    currentPerpPosition,
    amount,
    perpsAsset,
    limitPrice,
    isAutoLendEnabledForCurrentAccount,
    simulatePerps,
  })

  const effectiveLeverage = useMemo(() => {
    if (amount.isGreaterThan(maxAmount)) {
      return Math.max((amount.toNumber() / maxAmount.toNumber()) * maxLeverage, 0)
    }
    return Math.max(leverage, 0)
  }, [amount, maxAmount, leverage, maxLeverage])

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

  useEffect(() => {
    validateReduceOnlyOrder()
  }, [validateReduceOnlyOrder, amount, isReduceOnly])

  const closePosition = useCallback(() => {
    if (!currentAccount || !currentPerpPosition || !limitOrders) return

    const relevantOrderIds = limitOrders
      .filter((order) =>
        order.order.actions.some(
          (action) =>
            'execute_perp_order' in action && action.execute_perp_order.denom === perpsAsset.denom,
        ),
      )
      .map((order) => order.order.order_id)

    closePerpPosition({
      accountId: currentAccount.id,
      coin: BNCoin.fromDenomAndBigNumber(perpsAsset.denom, currentPerpPosition.amount.negated()),
      autolend: isAutoLendEnabledForCurrentAccount,
      baseDenom: currentPerpPosition.baseDenom,
      orderIds: relevantOrderIds,
      position: currentPerpPosition,
      debt: currentAccount.debts.find((debt) => debt.denom === currentPerpPosition.baseDenom),
    })
  }, [
    currentAccount,
    currentPerpPosition,
    limitOrders,
    closePerpPosition,
    perpsAsset.denom,
    isAutoLendEnabledForCurrentAccount,
  ])

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
      {perpsAsset.isDeprecated ? (
        <>
          <div className='flex flex-col gap-4'>
            <Text size='sm' uppercase>
              Disabled Market
            </Text>
            <Text size='xs'>
              The selected market is currently disabled, and opening new positions is unavailable.
            </Text>
            {currentPerpPosition && (
              <>
                <Text size='xs'>
                  You have an active position in this market. To manage your exposure, you may still
                  close your existing position by using the button below.
                </Text>
                <Text size='xs'>Click the button below to close your position.</Text>
              </>
            )}
          </div>
          {currentPerpPosition && (
            <div className='flex flex-col gap-4'>
              <ActionButton
                text='Close Position'
                onClick={() => {
                  closePosition()
                }}
              />
              <Callout type={CalloutType.INFO}>
                Please note: no new positions can be opened until the market is re-enabled.
              </Callout>
            </div>
          )}
        </>
      ) : (
        <>
          <div className='flex flex-col gap-5'>
            <OrderTypeSelector
              orderTabs={PERPS_ORDER_TYPE_TABS}
              selected={selectedOrderType}
              onChange={onChangeOrderType}
            />
            <PerpsTradeDirectionSelector
              isStopOrder={isStopOrder}
              tradeDirection={tradeDirection}
              stopTradeDirection={stopTradeDirection}
              onChangeTradeDirection={onChangeTradeDirection}
              onChangeStopTradeDirection={onChangeStopTradeDirection}
            />
            {isLimitOrder && (
              <LimitPriceSection
                USD={USD}
                limitPrice={limitPrice}
                setLimitPrice={setLimitPrice}
                limitPriceInfo={limitPriceInfo}
              />
            )}
            {isStopOrder && (
              <StopPriceSection
                USD={USD}
                stopPrice={stopPrice}
                setStopPrice={setStopPrice}
                stopPriceInfo={stopPriceInfo}
              />
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
            {amount.isGreaterThan(maxAmount) && (
              <Callout type={CalloutType.WARNING}>
                The entered amount exceeds the maximum allowed.
              </Callout>
            )}
            {perpsAsset && perpsAsset.price && (
              <div className='flex items-center gap-1 pb-2 text-xs text-white/60'>
                <span>
                  Open Interest left ({isStopOrder ? stopTradeDirection : tradeDirection}):
                </span>
                <FormattedNumber
                  amount={
                    tradeDirection === 'short' || stopTradeDirection === 'short'
                      ? shortOpenInterestLeft.toNumber()
                      : longOpenInterestLeft.toNumber()
                  }
                  options={{
                    suffix: ` ${perpsAsset.symbol}`,
                    abbreviated: true,
                  }}
                />
              </div>
            )}
            {!maxAmount.isZero() && !currentPerpPosition && (
              <LeverageSection
                maxLeverage={maxLeverage}
                effectiveLeverage={effectiveLeverage}
                onChangeLeverage={onChangeLeverage}
                tradeDirection={tradeDirection}
                isDisabledAmountInput={isDisabledAmountInput}
                maxAmount={maxAmount}
              />
            )}
            {warningMessages.value.map((message) => (
              <Callout key={message} type={CalloutType.WARNING}>
                {message}
              </Callout>
            ))}
            {currentPerpPosition && (isLimitOrder || isStopOrder) && (
              <ReduceOnlySwitch
                isReduceOnly={isReduceOnly}
                setIsReduceOnly={setIsReduceOnly}
                isStopOrder={isStopOrder}
                reduceOnlyWarning={reduceOnlyWarning}
              />
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
        </>
      )}
    </Card>
  )
}
