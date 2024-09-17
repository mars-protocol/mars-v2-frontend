import classNames from 'classnames'
import { useCallback, useMemo } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import { Callout, CalloutType } from 'components/common/Callout'
import { ArrowRight } from 'components/common/Icons'
import SummaryLine from 'components/common/SummaryLine'
import Text from 'components/common/Text'
import AssetAmount from 'components/common/assets/AssetAmount'
import TradeDirection from 'components/perps/BalancesTable/Columns/TradeDirection'
import { ExpectedPrice } from 'components/perps/Module/ExpectedPrice'
import TradingFee from 'components/perps/Module/TradingFee'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { formatLeverage } from 'utils/formatters'

type Props = {
  leverage: number
  amount: BigNumber
  tradeDirection: TradeDirection
  asset: Asset
  previousAmount: BigNumber
  previousTradeDirection?: 'long' | 'short'
  previousLeverage?: number | null
  hasActivePosition: boolean
  onTxExecuted: () => void
  disabled: boolean
}

export default function PerpsSummary(props: Props) {
  const { amount, previousAmount, tradeDirection, asset, onTxExecuted, disabled } = props
  const executePerpOrder = useStore((s) => s.executePerpOrder)
  const currentAccount = useCurrentAccount()

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

  return (
    <div className='flex flex-col bg-white bg-opacity-5 rounded border-[1px] border-white/20'>
      <ManageSummary {...props} newAmount={newAmount} />
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
      <ActionButton onClick={onConfirm} disabled={isDisabled} className='w-full py-2.5 !text-base'>
        <span className='mr-1 capitalize'>{tradeDirection}</span>
        {asset.symbol}
      </ActionButton>
    </div>
  )
}

function ManageSummary(props: Props & { newAmount: BigNumber }) {
  const {
    previousAmount,
    newAmount,
    leverage,
    previousLeverage,
    hasActivePosition,
    amount,
    previousTradeDirection,
    tradeDirection,
    asset,
  } = props
  const showTradeDirection =
    previousAmount && previousAmount.isNegative() !== newAmount.isNegative()
  const showAmount = !amount.isZero() && previousAmount
  const showLeverage =
    previousLeverage && leverage && previousLeverage.toFixed(2) !== leverage.toFixed(2)

  if ((!showTradeDirection && !showLeverage && !showAmount) || !hasActivePosition) return null

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

      {showTradeDirection && previousTradeDirection && !newAmount.isZero() && (
        <SummaryLine label='Side' contentClassName='flex gap-1'>
          <TradeDirection tradeDirection={previousTradeDirection} />
          <div className='w-4'>
            <ArrowRight />
          </div>
          <TradeDirection tradeDirection={tradeDirection} />
        </SummaryLine>
      )}

      {showAmount && newAmount && previousAmount && !newAmount.isZero() && (
        <SummaryLine label='Size' contentClassName='flex gap-1'>
          <AssetAmount asset={asset} amount={previousAmount.abs().toNumber()} />
          <div className='w-4'>
            <ArrowRight
              className={classNames(
                previousAmount.abs().isGreaterThan(newAmount) ? 'text-error' : 'text-success',
              )}
            />
          </div>
          <AssetAmount asset={asset} amount={previousAmount.plus(amount).abs().toNumber()} />
        </SummaryLine>
      )}

      {showLeverage && previousLeverage && (
        <SummaryLine label='Leverage' contentClassName='flex gap-1'>
          <span>{formatLeverage(previousLeverage)}</span>
          <div className='w-4'>
            <ArrowRight
              className={classNames(leverage > previousLeverage ? 'text-error' : 'text-success')}
            />
          </div>
          <span>{formatLeverage(leverage)}</span>
        </SummaryLine>
      )}
    </div>
  )
}
