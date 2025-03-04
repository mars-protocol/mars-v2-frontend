import { useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'

import AssetAmountInput from 'components/common/AssetAmountInput'
import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import { FormattedNumber } from 'components/common/FormattedNumber'
import OrderTypeSelector from 'components/common/OrderTypeSelector'
import { PERPS_ORDER_TYPE_TABS } from 'components/perps/Module/constants'
import KeeperFee from 'components/perps/Module/KeeperFee'
import { LeverageSection } from 'components/perps/Module/LeverageSection'
import PerpsSummary from 'components/perps/Module/Summary'
import PerpsTradeDirectionSelector from 'components/perps/Module/PerpsTradeDirectionSelector'
import MarginTypeSelector from 'components/perps/Module/MarginTypeSelector'
import { LimitPriceSection, StopPriceSection } from './PriceInputs'
import { ReduceOnlySwitch } from './ReduceOnlySwitch'
import AssetSelectorPerps from 'components/trade/TradeModule/AssetSelector/AssetSelectorPerps'
import IsolatedAccountMintAndFund from 'components/account/IsolatedAccountMintAndFund'

import { BN_ZERO } from 'constants/math'
import useStore from 'store'
import { OrderType } from 'types/enums'
import { byDenom } from 'utils/array'

import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useAssets from 'hooks/assets/useAssets'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { usePerpsOrderForm } from 'hooks/perps/usePerpsOrderForm'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import useAutoLend from 'hooks/wallet/useAutoLend'
import usePerpsModule from 'components/perps/Module/usePerpsModule'
import { useReduceOnlyOrder } from 'hooks/perps/useReduceOnlyOrder'
import { useLimitPriceInfo } from 'hooks/perps/useLimitPriceInfo'
import { useStopPriceInfo } from 'hooks/perps/useStopPriceInfo'
import { useHandleClosing } from 'hooks/perps/useHandleClosing'
import { useExecutionState } from 'hooks/perps/useExecutionState'
import { usePositionSimulation } from 'hooks/perps/usePositionSimulation'
import { usePerpsCallbacks } from 'hooks/perps/usePerpsCallbacks'
import { useOpenInterestLeft } from 'hooks/perps/useOpenInterestLeft'
import useHasIsolatedAccounts from 'hooks/accounts/useHasIsolatedAccounts'
import { getIsolatedAccounts } from 'utils/accounts'
import useChainConfig from 'hooks/chain/useChainConfig'

export function PerpsModule() {
  // State declarations
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const [stopTradeDirection, setStopTradeDirection] = useState<TradeDirection>('long')
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>(OrderType.MARKET)
  const [isReduceOnly, setIsReduceOnly] = useState(false)
  const [marginType, setMarginType] = useState<'cross' | 'isolated'>('cross')

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
  const { hasIsolatedAccounts } = useHasIsolatedAccounts()
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

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
  } = usePerpsModule({
    tradeDirection,
    limitPrice: isLimitOrder ? limitPrice : null,
    isStopOrder,
    stopTradeDirection,
    marginType,
  })
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

  // Handle margin type change
  const handleMarginTypeChange = async (type: 'cross' | 'isolated') => {
    setMarginType(type)
    if (type === 'isolated') {
      if (!hasIsolatedAccounts) {
        useStore.setState({
          focusComponent: {
            component: <IsolatedAccountMintAndFund />,
          },
        })
      } else {
        // Select first isolated account
        const isolatedAccounts = await getIsolatedAccounts(chainConfig, address || '')
        if (isolatedAccounts.length > 0) {
          useStore.setState((state) => ({
            ...state,
            accountId: isolatedAccounts[0].id,
          }))
        }
      }
    }
  }

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
        <MarginTypeSelector selected={marginType} onChange={handleMarginTypeChange} />
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
            <span>Open Interest left ({isStopOrder ? stopTradeDirection : tradeDirection}):</span>
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
    </Card>
  )
}
