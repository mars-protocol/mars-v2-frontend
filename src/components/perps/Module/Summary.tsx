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
import { useKeeperFee } from 'hooks/perps/useKeeperFee'
import usePerpsConfig from 'hooks/perps/usePerpsConfig'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import { useSubmitLimitOrder } from 'hooks/perps/useSubmitLimitOrder'
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
  hasActivePosition: boolean
  onTxExecuted: () => void
  disabled: boolean
  orderType: OrderType
  limitPrice: BigNumber
  stopPrice: BigNumber
  baseDenom: string
  isReduceOnly: boolean
  validateReduceOnlyOrder: () => boolean
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
    previousTradeDirection,
    baseDenom,
    limitPrice,
    stopPrice,
    isReduceOnly,
    validateReduceOnlyOrder,
  } = props
  const account = useCurrentAccount()
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const chainConfig = useChainConfig()
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

  const { calculateKeeperFee } = useKeeperFee()

  const finalKeeperFee = useMemo(() => {
    return isLimitOrder || isStopOrder ? calculateKeeperFee : undefined
  }, [isLimitOrder, isStopOrder, calculateKeeperFee])

  const submitLimitOrder = useSubmitLimitOrder()

  const onConfirm = useCallback(async () => {
    if (!currentAccount || !feeToken) return

    if (isReduceOnly && !validateReduceOnlyOrder()) return

    const orderSize = tradeDirection === 'short' && amount.isPositive() ? amount.negated() : amount

    if (isStopOrder && finalKeeperFee) {
      let comparison: 'less_than' | 'greater_than'
      let stopTradeDirection: 'long' | 'short'

      if (tradeDirection === 'long') {
        comparison = 'less_than'
        stopTradeDirection = 'short'
      } else {
        comparison = 'greater_than'
        stopTradeDirection = 'long'
      }

      await submitLimitOrder({
        asset,
        orderSize: orderSize,
        limitPrice: stopPrice,
        tradeDirection: stopTradeDirection,
        baseDenom,
        keeperFee: finalKeeperFee,
        isReduceOnly: true,
        comparison,
      })
      return onTxExecuted()
    }

    if (isLimitOrder && finalKeeperFee) {
      let comparison: 'less_than' | 'greater_than'

      if (tradeDirection === 'long') {
        comparison = 'less_than'
      } else {
        comparison = 'greater_than'
      }

      await submitLimitOrder({
        asset,
        orderSize,
        limitPrice,
        tradeDirection,
        baseDenom,
        comparison,
        keeperFee: finalKeeperFee,
        isReduceOnly,
      })
      return onTxExecuted()
    }

    const perpOrderParams = {
      accountId: currentAccount.id,
      coin: BNCoin.fromDenomAndBigNumber(asset.denom, orderSize),
      autolend: isAutoLendEnabledForCurrentAccount,
      baseDenom,
      reduceOnly: isReduceOnly,
    }

    await executePerpOrder(perpOrderParams)
    return onTxExecuted()
  }, [
    currentAccount,
    feeToken,
    isLimitOrder,
    isStopOrder,
    finalKeeperFee,
    asset,
    amount,
    tradeDirection,
    stopPrice,
    limitPrice,
    baseDenom,
    isReduceOnly,
    validateReduceOnlyOrder,
    isAutoLendEnabledForCurrentAccount,
    executePerpOrder,
    onTxExecuted,
    submitLimitOrder,
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
      <SummaryLine label='Leverage' contentClassName='flex gap-1'>
        {previousLeverage && !previousAmount.isZero() ? (
          <div className='flex items-center gap-1'>
            <span>{formatLeverage(previousLeverage)}</span>
            <div className='w-4'>
              <ArrowRight
                className={classNames(
                  leverage === undefined
                    ? 'text-error'
                    : leverage > previousLeverage
                      ? 'text-error'
                      : 'text-success',
                  'transition-colors duration-200',
                )}
              />
            </div>
            <span
              className={classNames(
                leverage === undefined
                  ? 'text-error'
                  : leverage > previousLeverage
                    ? 'text-error'
                    : 'text-success',
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
    </div>
  )
}
