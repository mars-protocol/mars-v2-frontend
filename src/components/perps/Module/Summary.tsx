import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'

import LiqPrice from 'components/account/AccountBalancesTable/Columns/LiqPrice'
import AlertDialog from 'components/common/AlertDialog'
import ActionButton from 'components/common/Button/ActionButton'
import { Callout, CalloutType } from 'components/common/Callout'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { ArrowRight } from 'components/common/Icons'
import SummaryLine from 'components/common/SummaryLine'
import Text from 'components/common/Text'
import AssetAmount from 'components/common/assets/AssetAmount'
import TradeDirection from 'components/perps/BalancesTable/Columns/TradeDirection'
import ConfirmationSummary from 'components/perps/Module/ConfirmationSummary'
import { ExpectedPrice } from 'components/perps/Module/ExpectedPrice'
import TradingFee from 'components/perps/Module/TradingFee'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useKeeperFee from 'hooks/perps/useKeeperFee'
import usePerpsConfig from 'hooks/perps/usePerpsConfig'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import { useSubmitLimitOrder } from 'hooks/perps/useSubmitLimitOrder'
import { useSubmitParentOrderWithChildren } from 'hooks/perps/useSubmitParentOrderWithChildren'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { OrderType } from 'types/enums'
import { byDenom } from 'utils/array'
import { formatLeverage, getPerpsPriceDecimals } from 'utils/formatters'

type Props = {
  leverage: number
  amount: BigNumber
  tradeDirection: TradeDirection
  asset: Asset
  previousAmount: BigNumber
  previousTradeDirection?: TradeDirection
  previousLeverage?: number | null
  onTxExecuted: () => void
  disabled: boolean
  orderType: OrderType
  limitPrice: BigNumber
  stopPrice: BigNumber
  baseDenom: string
  isReduceOnly: boolean
  validateReduceOnlyOrder: () => boolean
  conditionalTriggers: { sl: string | null; tp: string | null }
}

export default function PerpsSummary(props: Props) {
  const {
    amount,
    previousAmount,
    tradeDirection,
    asset,
    leverage,
    onTxExecuted,
    disabled,
    baseDenom,
    limitPrice,
    stopPrice,
    isReduceOnly,
    conditionalTriggers,
    validateReduceOnlyOrder,
  } = props
  const account = useCurrentAccount()
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const chainConfig = useChainConfig()
  const { calculateKeeperFee } = useKeeperFee()
  const currentAccount = useCurrentAccount()
  const isLimitOrder = props.orderType === OrderType.LIMIT
  const isStopOrder = props.orderType === OrderType.STOP

  const { data: perpsConfig } = usePerpsConfig()
  const assets = useDepositEnabledAssets()
  const executePerpOrder = useStore((s) => s.executePerpOrder)
  const [showSummary, setShowSummary] = useLocalStorage<boolean>(
    `${chainConfig.id}/${LocalStorageKeys.SHOW_SUMMARY}`,
    getDefaultChainSettings(chainConfig).showSummary,
  )
  const { computeLiquidationPrice } = useHealthComputer(updatedAccount ?? account)

  const newAmount = useMemo(
    () => (previousAmount ?? BN_ZERO).plus(amount),
    [amount, previousAmount],
  )

  const perpsParams = usePerpsParams(props.asset.denom)

  const feeToken = useMemo(
    () => assets.find(byDenom(perpsConfig?.base_denom ?? '')),
    [assets, perpsConfig?.base_denom],
  )

  const finalKeeperFee = useMemo(() => {
    return isLimitOrder || isStopOrder ? calculateKeeperFee : undefined
  }, [isLimitOrder, isStopOrder, calculateKeeperFee])

  const submitLimitOrder = useSubmitLimitOrder()
  const submitParentOrderWithChildren = useSubmitParentOrderWithChildren()

  const handleTriggerOrder = useCallback(async () => {
    if (!currentAccount || !feeToken || !calculateKeeperFee) return false

    await submitParentOrderWithChildren({
      asset,
      amount,
      tradeDirection,
      baseDenom,
      orderType: props.orderType,
      limitPrice: isLimitOrder ? limitPrice : undefined,
      stopPrice: isStopOrder ? stopPrice : undefined,
      isReduceOnly,
      conditionalTriggers,
    })
    return true
  }, [
    asset,
    amount,
    tradeDirection,
    baseDenom,
    props.orderType,
    isLimitOrder,
    limitPrice,
    isStopOrder,
    stopPrice,
    isReduceOnly,
    conditionalTriggers,
    submitParentOrderWithChildren,
    currentAccount,
    feeToken,
    calculateKeeperFee,
  ])

  const handleStopOrder = useCallback(async () => {
    if (!calculateKeeperFee) return false

    let comparison: 'less_than' | 'greater_than'
    let stopTradeDirection: 'long' | 'short'

    if (tradeDirection === 'long') {
      comparison = 'less_than'
      stopTradeDirection = 'short'
    } else {
      comparison = 'greater_than'
      stopTradeDirection = 'long'
    }

    const orderSize = tradeDirection === 'short' && amount.isPositive() ? amount.negated() : amount

    await submitLimitOrder({
      asset,
      orderSize: orderSize,
      limitPrice: stopPrice,
      tradeDirection: stopTradeDirection,
      baseDenom,
      keeperFee: calculateKeeperFee,
      reduceOnly: true,
      comparison,
    })
    return true
  }, [tradeDirection, amount, asset, stopPrice, baseDenom, calculateKeeperFee, submitLimitOrder])

  const handleLimitOrder = useCallback(async () => {
    if (!calculateKeeperFee) return false

    const comparison = tradeDirection === 'long' ? 'less_than' : 'greater_than'

    const orderSize = tradeDirection === 'short' && amount.isPositive() ? amount.negated() : amount

    await submitLimitOrder({
      asset,
      orderSize,
      limitPrice,
      tradeDirection,
      baseDenom,
      comparison,
      keeperFee: calculateKeeperFee,
      reduceOnly: isReduceOnly,
    })
    return true
  }, [
    calculateKeeperFee,
    tradeDirection,
    amount,
    asset,
    limitPrice,
    baseDenom,
    isReduceOnly,
    submitLimitOrder,
  ])

  const handleMarketOrder = useCallback(async () => {
    if (!currentAccount) return false

    const orderSize = tradeDirection === 'short' && amount.isPositive() ? amount.negated() : amount

    const perpOrderParams = {
      accountId: currentAccount.id,
      coin: BNCoin.fromDenomAndBigNumber(asset.denom, orderSize),
      autolend: isAutoLendEnabledForCurrentAccount,
      baseDenom,
      reduceOnly: isReduceOnly,
      keeperFee: calculateKeeperFee,
      conditionalTriggers,
    }

    await executePerpOrder(perpOrderParams)
    return true
  }, [
    currentAccount,
    tradeDirection,
    amount,
    asset.denom,
    isAutoLendEnabledForCurrentAccount,
    baseDenom,
    isReduceOnly,
    executePerpOrder,
    calculateKeeperFee,
    conditionalTriggers,
  ])

  const onConfirm = useCallback(async () => {
    if (!currentAccount || !feeToken) return
    if (isReduceOnly && !validateReduceOnlyOrder()) return

    const hasTriggers = !!(conditionalTriggers.tp ?? conditionalTriggers.sl)
    let success = false

    if (hasTriggers) {
      success = await handleTriggerOrder()
    } else if (isStopOrder) {
      success = await handleStopOrder()
    } else if (isLimitOrder) {
      success = await handleLimitOrder()
    } else {
      success = await handleMarketOrder()
    }

    if (success) {
      onTxExecuted()
    }
  }, [
    currentAccount,
    feeToken,
    isReduceOnly,
    validateReduceOnlyOrder,
    conditionalTriggers,
    isStopOrder,
    isLimitOrder,
    handleTriggerOrder,
    handleStopOrder,
    handleLimitOrder,
    handleMarketOrder,
    onTxExecuted,
  ])

  const isDisabled = useMemo(() => amount.isZero() || disabled, [amount, disabled])

  const tradingFeeTooltip = useMemo(() => {
    const text = 'Trading Fees'
    if (!perpsParams) return text
    if (amount.plus(previousAmount).abs().isGreaterThanOrEqualTo(previousAmount.abs())) {
      return `${perpsParams.openingFeeRate.times(100)}% ${text}`
    }

    return `${perpsParams.closingFeeRate.times(100)}% ${text}`
  }, [perpsParams, amount, previousAmount])

  const isNewPosition = previousAmount.isZero()
  const isDirectionChange = useMemo(
    () => !isNewPosition && previousAmount.isNegative() !== newAmount.isNegative(),
    [isNewPosition, previousAmount, newAmount],
  )

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOnClick = useCallback(() => {
    if (!currentAccount) return
    if (!showSummary) {
      onConfirm()
      return
    }
    setIsDialogOpen(true)
  }, [currentAccount, showSummary, onConfirm])

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  const handleConfirm = () => {
    onConfirm()
    setIsDialogOpen(false)
  }

  const submitBtnText = useMemo(() => {
    if (isStopOrder) return 'Create Stop Order'
    if (isLimitOrder) return 'Create Limit Order'
  }, [isStopOrder, isLimitOrder])

  return (
    <div className='flex w-full flex-col bg-white bg-opacity-5 rounded border-[1px] border-white/20'>
      <ManageSummary
        {...props}
        newAmount={newAmount}
        isNewPosition={isNewPosition}
        isDirectionChange={isDirectionChange}
        priceOverride={isLimitOrder ? limitPrice : undefined}
      />
      <div className='flex flex-col gap-1 px-3 py-4'>
        <Text size='xs' className='mb-2 font-bold'>
          Summary
        </Text>
        <SummaryLine label='Expected Price'>
          <ExpectedPrice
            denom={asset.denom}
            newAmount={newAmount}
            override={isLimitOrder ? limitPrice : undefined}
            tradeDirection={tradeDirection}
          />
        </SummaryLine>
        {!isLimitOrder && (
          <SummaryLine label='Liquidation Price'>
            {account && (
              <LiqPrice
                denom={asset.denom}
                computeLiquidationPrice={computeLiquidationPrice}
                type='perp'
                amount={newAmount.isEqualTo(previousAmount) ? 0 : newAmount.toNumber()}
                account={updatedAccount ?? account}
                isWhitelisted={true}
              />
            )}
          </SummaryLine>
        )}
        <SummaryLine label='Fees' tooltip={tradingFeeTooltip}>
          <TradingFee
            denom={asset.denom}
            newAmount={newAmount}
            previousAmount={previousAmount}
            keeperFee={finalKeeperFee}
          />
        </SummaryLine>
      </div>
      <ActionButton
        onClick={handleOnClick}
        disabled={isDisabled}
        className='w-full py-2.5 !text-base'
      >
        {isLimitOrder || isStopOrder ? (
          submitBtnText
        ) : (
          <>
            <span className='mr-1 capitalize'>{tradeDirection}</span>
            {asset.symbol}
          </>
        )}
      </ActionButton>

      <AlertDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        header={
          <div className='flex items-center justify-between w-full'>
            <Text size='2xl'>{isLimitOrder ? 'Limit Order Summary' : 'Order Summary'}</Text>
          </div>
        }
        content={
          <ConfirmationSummary
            amount={amount}
            accountId={currentAccount?.id || ''}
            asset={asset}
            leverage={leverage}
            limitPrice={isLimitOrder ? limitPrice : undefined}
            keeperFee={finalKeeperFee}
          />
        }
        positiveButton={{
          text: 'Continue',
          icon: <ArrowRight />,
          onClick: handleConfirm,
        }}
        checkbox={{
          text: 'Hide summary in the future',
          onClick: (isChecked: boolean) => setShowSummary(!isChecked),
        }}
        isSingleButtonLayout
        showCloseButton
      />
    </div>
  )
}

interface SideSectionProps {
  isNewPosition: boolean
  isDirectionChange: boolean
  tradeDirection: TradeDirection
  previousTradeDirection?: TradeDirection
  isLimitOrder: boolean
}

function SideSection({
  isNewPosition,
  isDirectionChange,
  tradeDirection,
  previousTradeDirection,
  isLimitOrder,
}: SideSectionProps) {
  if (!previousTradeDirection || !tradeDirection) return null

  return (
    <SummaryLine
      label={isDirectionChange && !isNewPosition ? 'New Side' : 'Side'}
      contentClassName='flex gap-1'
    >
      <TradeDirection
        tradeDirection={
          isNewPosition || isDirectionChange ? tradeDirection : previousTradeDirection
        }
        type={isLimitOrder ? 'limit' : 'stop'}
        previousTradeDirection={isDirectionChange ? previousTradeDirection : undefined}
      />
    </SummaryLine>
  )
}

interface LeverageSectionProps {
  previousLeverage?: number | null
  leverage: number
  previousAmount: BigNumber
}

function getLeverageArrowClass(leverage: number, previousLeverage: number | null | undefined) {
  if (leverage === undefined) return 'text-error'
  if (previousLeverage === null || previousLeverage === undefined) return ''
  return leverage > previousLeverage ? 'text-error' : 'text-success'
}

function LeverageSection({ previousLeverage, leverage, previousAmount }: LeverageSectionProps) {
  return (
    <SummaryLine label='Leverage' contentClassName='flex gap-1'>
      {previousLeverage && !previousAmount.isZero() ? (
        <div className='flex items-center gap-1'>
          <span>{formatLeverage(previousLeverage)}</span>
          <div className='w-4'>
            <ArrowRight
              className={classNames(
                getLeverageArrowClass(leverage, previousLeverage),
                'transition-colors duration-200',
              )}
            />
          </div>
          <span
            className={classNames(
              getLeverageArrowClass(leverage, previousLeverage),
              'transition-colors duration-200',
            )}
          >
            {leverage === undefined ? '—' : formatLeverage(leverage)}
          </span>
        </div>
      ) : (
        <span>{leverage === undefined ? '—' : formatLeverage(leverage)}</span>
      )}
    </SummaryLine>
  )
}

function ManageSummary(
  props: Props & {
    newAmount: BigNumber
    isNewPosition: boolean
    isDirectionChange: boolean
    priceOverride?: BigNumber
  },
) {
  const {
    previousAmount,
    newAmount,
    leverage,
    previousLeverage,
    amount,
    previousTradeDirection,
    tradeDirection,
    asset,
    isNewPosition,
    isDirectionChange,
    priceOverride,
  } = props

  const size = useMemo(() => previousAmount.plus(amount).abs(), [amount, previousAmount])
  const isLimitOrder = props.orderType === OrderType.LIMIT

  if (amount.isZero()) return null

  return (
    <div className='flex flex-col gap-1 px-3 pt-4'>
      <Text size='xs' className='mb-2 font-bold'>
        Your new position
      </Text>

      {newAmount.isZero() && (
        <Callout type={CalloutType.INFO} className='mb-2'>
          Your position will be closed
        </Callout>
      )}

      {previousTradeDirection && !newAmount.isZero() && (
        <SideSection
          isNewPosition={isNewPosition}
          isDirectionChange={isDirectionChange}
          tradeDirection={tradeDirection}
          previousTradeDirection={previousTradeDirection}
          isLimitOrder={isLimitOrder}
        />
      )}

      <SummaryLine label={isNewPosition ? 'Size' : 'New Size'} contentClassName='flex gap-1'>
        <AssetAmount asset={asset} amount={size.toNumber()} />
      </SummaryLine>

      <SummaryLine label={isNewPosition ? 'Value' : 'New Value'} contentClassName='flex gap-1'>
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber(
            priceOverride ? 'usd' : asset.denom,
            priceOverride ? size.times(priceOverride).shiftedBy(-asset.decimals) : size,
          )}
          options={{
            maxDecimals: getPerpsPriceDecimals(priceOverride ?? size),
            abbreviated: false,
          }}
        />
      </SummaryLine>

      <LeverageSection
        previousLeverage={previousLeverage}
        leverage={leverage}
        previousAmount={previousAmount}
      />
    </div>
  )
}
