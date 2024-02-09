import classNames from 'classnames'
import { useCallback, useMemo } from 'react'

import AssetAmount from 'components/common/assets/AssetAmount'
import ActionButton from 'components/common/Button/ActionButton'
import { ArrowRight } from 'components/common/Icons'
import SummaryLine from 'components/common/SummaryLine'
import Text from 'components/common/Text'
import TradeDirection from 'components/perps/BalancesTable/Columns/TradeDirection'
import TradingFee from 'components/perps/Module/TradingFee'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useTradingFee from 'hooks/perps/useTradingFee'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { formatLeverage } from 'utils/formatters'

type Props = {
  leverage: number
  amount: BigNumber
  tradeDirection: TradeDirection
  asset: Asset
  previousAmount?: BigNumber | null
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
  const { data: tradingFee, isLoading } = useTradingFee(props.asset.denom, props.amount)

  const newAmount = useMemo(
    () => (props.previousAmount ?? BN_ZERO).plus(props.amount),
    [props.amount, props.previousAmount],
  )

  const onConfirm = useCallback(async () => {
    if (!currentAccount) return

    if (props.previousAmount && newAmount.isZero()) {
      await closePerpPosition({
        accountId: currentAccount.id,
        denom: props.asset.denom,
      })
      return props.onTxExecuted()
    }

    if (props.previousAmount && newAmount) {
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

  return (
    <div className='border border-white/10 rounded-sm bg-white/5'>
      <ManageSummary {...props} newAmount={newAmount} />
      <div className='py-4 px-3 flex flex-col gap-1'>
        <Text size='xs' className='font-bold mb-2'>
          Summary
        </Text>
        <SummaryLine label='Expected Price'>-</SummaryLine>
        <SummaryLine
          label='Fees'
          tooltip={`${tradingFee ? tradingFee.rate.times(100) + '% ' : ''}Trading Fees`}
        >
          <TradingFee denom={props.asset.denom} amount={props.amount} />
        </SummaryLine>
        <SummaryLine label='Total'>-</SummaryLine>
      </div>
      <ActionButton onClick={onConfirm} disabled={disabled} className='w-full py-2.5'>
        <span className='capitalize mr-1'>{props.tradeDirection}</span>
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
    <div className='pt-4 px-3 flex flex-col gap-1'>
      <Text size='xs' className='font-bold mb-2'>
        Your new position
      </Text>

      {props.newAmount.isZero() && (
        <Text size='xs' className='text-white/40 mb-1'>
          Your position will be closed
        </Text>
      )}

      {showTradeDirection && props.previousTradeDirection && !props.newAmount.isZero() && (
        <SummaryLine label='Side' contentClassName='flex gap-1'>
          <TradeDirection tradeDirection={props.previousTradeDirection} />
          <ArrowRight width={16} />
          <TradeDirection tradeDirection={props.tradeDirection} />
        </SummaryLine>
      )}

      {showAmount && props.newAmount && props.previousAmount && !props.newAmount.isZero() && (
        <SummaryLine label='Size' contentClassName='flex gap-1'>
          <AssetAmount asset={props.asset} amount={props.previousAmount.abs().toNumber()} />
          <ArrowRight
            width={16}
            className={classNames(
              props.previousAmount.abs().isGreaterThan(props.newAmount)
                ? 'text-error'
                : 'text-success',
            )}
          />
          <AssetAmount
            asset={props.asset}
            amount={props.previousAmount.plus(props.amount).abs().toNumber()}
          />
        </SummaryLine>
      )}

      {showLeverage && props.previousLeverage && (
        <SummaryLine label='Leverage' contentClassName='flex gap-1'>
          <span>{formatLeverage(props.previousLeverage)}</span>
          <ArrowRight
            width={16}
            className={classNames(
              props.leverage > props.previousLeverage ? 'text-error' : 'text-success',
            )}
          />
          <span>{formatLeverage(props.leverage)}</span>
        </SummaryLine>
      )}
    </div>
  )
}
