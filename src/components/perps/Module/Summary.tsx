import classNames from 'classnames'
import { useCallback, useMemo } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import { Callout, CalloutType } from 'components/common/Callout'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { ArrowRight, Check } from 'components/common/Icons'
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
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import usePerpsConfig from 'hooks/perps/usePerpsConfig'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { OrderType } from 'types/enums'
import { byDenom } from 'utils/array'
import { formatLeverage, magnify } from 'utils/formatters'

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
  baseDenom: string
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
  } = props

  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const chainConfig = useChainConfig()
  const [keeperFee, _] = useLocalStorage(
    LocalStorageKeys.PERPS_KEEPER_FEE,
    getDefaultChainSettings(chainConfig).perpsKeeperFee,
  )
  const currentAccount = useCurrentAccount()
  const isLimitOrder = props.orderType === OrderType.LIMIT
  const { data: perpsConfig } = usePerpsConfig()
  const assets = useDepositEnabledAssets()
  const executePerpOrder = useStore((s) => s.executePerpOrder)
  const createTriggerOrder = useStore((s) => s.createTriggerOrder)
  const [showSummary, setShowSummary] = useLocalStorage<boolean>(
    LocalStorageKeys.SHOW_SUMMARY,
    getDefaultChainSettings(chainConfig).showSummary,
  )

  const newAmount = useMemo(
    () => (previousAmount ?? BN_ZERO).plus(amount),
    [amount, previousAmount],
  )

  const perpsParams = usePerpsParams(props.asset.denom)
  const feeToken = useMemo(
    () => assets.find(byDenom(perpsConfig?.base_denom ?? '')),
    [assets, perpsConfig?.base_denom],
  )
  const calculateKeeperFee = useMemo(
    () =>
      isLimitOrder && feeToken
        ? BNCoin.fromDenomAndBigNumber(feeToken.denom, magnify(keeperFee.amount, feeToken))
        : undefined,
    [feeToken, isLimitOrder, keeperFee.amount],
  )

  const onConfirm = useCallback(async () => {
    if (!currentAccount || !feeToken) return
    const orderSize = tradeDirection === 'short' && amount.isPositive() ? amount.negated() : amount

    const triggers: Trigger[] = []

    if (isLimitOrder) {
      const decimalAdjustment = asset.decimals - PRICE_ORACLE_DECIMALS
      const adjustedLimitPrice = props.limitPrice.shiftedBy(-decimalAdjustment)

      triggers.push({
        price_trigger: {
          denom: props.asset.denom,
          oracle_price: adjustedLimitPrice.toString(),
          trigger_type: props.tradeDirection === 'long' ? 'less_than' : 'greater_than',
        },
      })
    }

    if (isLimitOrder && calculateKeeperFee) {
      const decimalAdjustment = asset.decimals - PRICE_ORACLE_DECIMALS
      const adjustedLimitPrice = limitPrice.shiftedBy(-decimalAdjustment)

      const triggerOrderParams = {
        accountId: currentAccount.id,
        coin: BNCoin.fromDenomAndBigNumber(asset.denom, orderSize),
        autolend: isAutoLendEnabledForCurrentAccount,
        baseDenom,
        keeperFee: calculateKeeperFee,
        tradeDirection,
        price: adjustedLimitPrice,
      }

      await createTriggerOrder(triggerOrderParams)
      return onTxExecuted()
    }

    const perpOrderParams = {
      accountId: currentAccount.id,
      coin: BNCoin.fromDenomAndBigNumber(asset.denom, orderSize),
      autolend: isAutoLendEnabledForCurrentAccount,
      baseDenom,
    }

    await executePerpOrder(perpOrderParams)
    return onTxExecuted()
  }, [
    currentAccount,
    feeToken,
    isLimitOrder,
    calculateKeeperFee,
    asset.denom,
    asset.decimals,
    amount,
    isAutoLendEnabledForCurrentAccount,
    baseDenom,
    executePerpOrder,
    onTxExecuted,
    props.limitPrice,
    props.asset.denom,
    props.tradeDirection,
    limitPrice,
    tradeDirection,
    createTriggerOrder,
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

  const { open: openAlertDialog, close } = useAlertDialog()

  const handleOnClick = useCallback(() => {
    if (!currentAccount) return
    if (!showSummary) {
      onConfirm()
      return
    }
    openAlertDialog({
      header: (
        <div className='flex items-center justify-between w-full'>
          <Text size='2xl'>{isLimitOrder ? 'Limit Order Summary' : 'Order Summary'}</Text>
          <TradeDirection
            tradeDirection={
              isNewPosition || isDirectionChange
                ? tradeDirection
                : (previousTradeDirection ?? 'long')
            }
            className='capitalize !text-sm'
          />
        </div>
      ),
      content: (
        <ConfirmationSummary
          amount={amount}
          accountId={currentAccount.id}
          asset={asset}
          leverage={leverage}
          limitPrice={isLimitOrder ? limitPrice : undefined}
          keeperFee={isLimitOrder ? calculateKeeperFee : undefined}
        />
      ),
      positiveButton: {
        text: 'Confirm',
        icon: <Check />,
        onClick: onConfirm,
      },
      negativeButton: {
        text: 'Cancel',
        onClick: () => {
          close()
        },
      },
      checkbox: {
        text: 'Hide summary in the future',
        onClick: (isChecked: boolean) => setShowSummary(!isChecked),
      },
    })
  }, [
    amount,
    asset,
    close,
    currentAccount,
    isDirectionChange,
    isLimitOrder,
    isNewPosition,
    calculateKeeperFee,
    leverage,
    limitPrice,
    onConfirm,
    openAlertDialog,
    previousTradeDirection,
    setShowSummary,
    showSummary,
    tradeDirection,
  ])

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
          />
        </SummaryLine>
        <SummaryLine label='Fees' tooltip={tradingFeeTooltip}>
          <TradingFee
            denom={asset.denom}
            newAmount={newAmount}
            previousAmount={previousAmount}
            keeperFee={calculateKeeperFee}
          />
        </SummaryLine>
      </div>
      <ActionButton
        onClick={handleOnClick}
        disabled={isDisabled}
        className='w-full py-2.5 !text-base'
      >
        {isLimitOrder ? (
          'Create Limit Order'
        ) : (
          <>
            <span className='mr-1 capitalize'>{tradeDirection}</span>
            {asset.symbol}
          </>
        )}
      </ActionButton>
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
          options={{ abbreviated: false }}
        />
      </SummaryLine>
      <SummaryLine label='Leverage' contentClassName='flex gap-1 pt-2'>
        {previousLeverage && !previousAmount.isZero() && (
          <>
            <span>{formatLeverage(previousLeverage)}</span>
            <div className='w-4'>
              <ArrowRight
                className={classNames(leverage > previousLeverage ? 'text-error' : 'text-success')}
              />
            </div>
          </>
        )}
        <span>{formatLeverage(leverage)}</span>
      </SummaryLine>
    </div>
  )
}
