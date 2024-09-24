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
import { ExpectedPrice } from 'components/perps/Module/ExpectedPrice'
import TradingFee from 'components/perps/Module/TradingFee'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { formatLeverage } from 'utils/formatters'
import ConfirmationSummary from './ConfirmationSummary'

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
  } = props
  const executePerpOrder = useStore((s) => s.executePerpOrder)
  const currentAccount = useCurrentAccount()
  const chainConfig = useChainConfig()
  const [showSummary, setShowSummary] = useLocalStorage<boolean>(
    LocalStorageKeys.SHOW_SUMMARY,
    getDefaultChainSettings(chainConfig).showSummary,
  )

  const newAmount = useMemo(
    () => (previousAmount ?? BN_ZERO).plus(amount),
    [amount, previousAmount],
  )
  const perpsParams = usePerpsParams(asset.denom)

  const onConfirm = useCallback(async () => {
    if (!currentAccount) return
    const modifyAmount = newAmount.minus(previousAmount)

    await executePerpOrder({
      accountId: currentAccount.id,
      coin: BNCoin.fromDenomAndBigNumber(asset.denom, modifyAmount),
    })
    return onTxExecuted()
  }, [asset.denom, currentAccount, executePerpOrder, newAmount, onTxExecuted, previousAmount])

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
          <Text size='2xl'>Order Summary</Text>
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
    asset,
    close,
    currentAccount,
    isDirectionChange,
    isNewPosition,
    leverage,
    newAmount,
    onConfirm,
    openAlertDialog,
    previousTradeDirection,
    setShowSummary,
    showSummary,
    tradeDirection,
  ])

  return (
    <div className='flex flex-col bg-white bg-opacity-5 rounded border-[1px] border-white/20'>
      <ManageSummary
        {...props}
        newAmount={newAmount}
        isNewPosition={isNewPosition}
        isDirectionChange={isDirectionChange}
      />
      <div className='flex flex-col gap-1 px-3 py-4'>
        <Text size='xs' className='mb-2 font-bold'>
          Summary
        </Text>
        <SummaryLine label='Expected Price'>
          <ExpectedPrice
            denom={asset.denom}
            newAmount={newAmount}
            previousAmount={previousAmount}
          />
        </SummaryLine>
        <SummaryLine label='Fees' tooltip={tradingFeeTooltip}>
          <TradingFee denom={asset.denom} newAmount={newAmount} previousAmount={previousAmount} />
        </SummaryLine>
      </div>
      <ActionButton
        onClick={handleOnClick}
        disabled={isDisabled}
        className='w-full py-2.5 !text-base'
      >
        <span className='mr-1 capitalize'>{tradeDirection}</span>
        {asset.symbol}
      </ActionButton>
    </div>
  )
}

function ManageSummary(
  props: Props & { newAmount: BigNumber; isNewPosition: boolean; isDirectionChange: boolean },
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
          />
        </SummaryLine>
      )}

      <SummaryLine label={isNewPosition ? 'Size' : 'New Size'} contentClassName='flex gap-1'>
        <AssetAmount asset={asset} amount={size.toNumber()} />
      </SummaryLine>
      <SummaryLine label={isNewPosition ? 'Value' : 'New Value'} contentClassName='flex gap-1'>
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber(asset.denom, size)}
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
