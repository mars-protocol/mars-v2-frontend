import classNames from 'classnames'
import { useCallback, useMemo } from 'react'

import AssetAmount from 'components/common/assets/AssetAmount'
import ActionButton from 'components/common/Button/ActionButton'
import { ArrowRight } from 'components/common/Icons'
import SummaryLine from 'components/common/SummaryLine'
import Text from 'components/common/Text'
import TradeDirection from 'components/perps/BalancesTable/Columns/TradeDirection'
import { ExpectedPrice } from 'components/perps/Module/ExpectedPrice'
import TradingFee from 'components/perps/Module/TradingFee'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
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
}

export default function PerpsSummary(props: Props) {
  const openPerpPosition = useStore((s) => s.openPerpPosition)
  const modifyPerpPosition = useStore((s) => s.modifyPerpPosition)
  const closePerpPosition = useStore((s) => s.closePerpPosition)
  const currentAccount = useCurrentAccount()

  const newAmount = useMemo(
    () => (props.previousAmount ?? BN_ZERO).plus(props.amount),
    [props.amount, props.previousAmount],
  )
  const { data: tradingFee } = useTradingFeeAndPrice(
    props.asset.denom,
    newAmount,
    props.previousAmount,
  )

  const perpsParams = usePerpsParams(props.asset.denom)

  const onConfirm = useCallback(async () => {
    if (!currentAccount) return

    if (!props.previousAmount.isZero() && newAmount.isZero()) {
      await closePerpPosition({
        accountId: currentAccount.id,
        denom: props.asset.denom,
      })
      return props.onTxExecuted()
    }

    if (!props.previousAmount.isZero() && !newAmount.isZero()) {
      await modifyPerpPosition({
        accountId: currentAccount.id,
        coin: BNCoin.fromDenomAndBigNumber(props.asset.denom, newAmount),
        changeDirection: props.previousAmount.isNegative() !== newAmount.isNegative(),
      })
      return props.onTxExecuted()
    }

    await openPerpPosition({
      accountId: currentAccount.id,
      coin: BNCoin.fromDenomAndBigNumber(props.asset.denom, props.amount),
    })
    return props.onTxExecuted()
  }, [closePerpPosition, currentAccount, modifyPerpPosition, newAmount, openPerpPosition, props])

  const disabled = useMemo(() => props.amount.isZero(), [props.amount])

  const tradingFeeTooltip = useMemo(() => {
    let text = 'Trading Fees'
    if (!perpsParams) return text
    if (
      props.amount
        .plus(props.previousAmount)
        .abs()
        .isGreaterThanOrEqualTo(props.previousAmount.abs())
    ) {
      return `${perpsParams.openingFeeRate.times(100)}% ${text}`
    }

    return `${perpsParams.closingFeeRate.times(100)}% ${text}`
  }, [perpsParams, props.amount, props.previousAmount])

  return (
    <div className='border rounded-sm border-white/10 bg-white/5'>
      <ManageSummary {...props} newAmount={newAmount} />
      <div className='flex flex-col gap-1 px-3 py-4'>
        <Text size='xs' className='mb-2 font-bold'>
          Summary
        </Text>
        <SummaryLine label='Expected Price'>
          <ExpectedPrice
            denom={props.asset.denom}
            newAmount={newAmount}
            previousAmount={props.previousAmount}
          />
        </SummaryLine>
        <SummaryLine label='Fees' tooltip={tradingFeeTooltip}>
          <TradingFee
            denom={props.asset.denom}
            newAmount={newAmount}
            previousAmount={props.previousAmount}
          />
        </SummaryLine>
      </div>
      <ActionButton onClick={onConfirm} disabled={disabled} className='w-full py-2.5'>
        <span className='mr-1 capitalize'>{props.tradeDirection}</span>
        {props.asset.symbol}
      </ActionButton>
    </div>
  )
}

function ManageSummary(props: Props & { newAmount: BigNumber }) {
  const showTradeDirection =
    props.previousAmount && props.previousAmount.isNegative() !== props.newAmount.isNegative()
  const showAmount = !props.amount.isZero() && props.previousAmount
  const showLeverage =
    props.previousLeverage &&
    props.leverage &&
    props.previousLeverage.toFixed(2) !== props.leverage.toFixed(2)

  if ((!showTradeDirection && !showLeverage && !showAmount) || !props.hasActivePosition) return null

  return (
    <div className='flex flex-col gap-1 px-3 pt-4'>
      <Text size='xs' className='mb-2 font-bold'>
        Your new position
      </Text>

      {props.newAmount.isZero() && (
        <Text size='xs' className='mb-1 text-white/40'>
          Your position will be closed
        </Text>
      )}

      {showTradeDirection && props.previousTradeDirection && !props.newAmount.isZero() && (
        <SummaryLine label='Side' contentClassName='flex gap-1'>
          <TradeDirection tradeDirection={props.previousTradeDirection} />
          <div className='w-4'>
            <ArrowRight />
          </div>
          <TradeDirection tradeDirection={props.tradeDirection} />
        </SummaryLine>
      )}

      {showAmount && props.newAmount && props.previousAmount && !props.newAmount.isZero() && (
        <SummaryLine label='Size' contentClassName='flex gap-1'>
          <AssetAmount asset={props.asset} amount={props.previousAmount.abs().toNumber()} />
          <div className='w-4'>
            <ArrowRight
              className={classNames(
                props.previousAmount.abs().isGreaterThan(props.newAmount)
                  ? 'text-error'
                  : 'text-success',
              )}
            />
          </div>
          <AssetAmount
            asset={props.asset}
            amount={props.previousAmount.plus(props.amount).abs().toNumber()}
          />
        </SummaryLine>
      )}

      {showLeverage && props.previousLeverage && (
        <SummaryLine label='Leverage' contentClassName='flex gap-1'>
          <span>{formatLeverage(props.previousLeverage)}</span>
          <div className='w-4'>
            <ArrowRight
              className={classNames(
                props.leverage > props.previousLeverage ? 'text-error' : 'text-success',
              )}
            />
          </div>
          <span>{formatLeverage(props.leverage)}</span>
        </SummaryLine>
      )}
    </div>
  )
}
