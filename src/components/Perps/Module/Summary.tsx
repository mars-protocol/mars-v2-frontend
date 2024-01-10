import classNames from 'classnames'
import { useCallback, useMemo } from 'react'

import AssetAmount from 'components/Asset/AssetAmount'
import ActionButton from 'components/Button/ActionButton'
import { ArrowRight } from 'components/Icons'
import TradeDirection from 'components/Perps/BalancesTable/Columns/TradeDirection'
import SummaryLine from 'components/SummaryLine'
import Text from 'components/Text'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { formatLeverage } from 'utils/formatters'

type Props = {
  leverage: number
  amount: BigNumber
  tradeDirection: TradeDirection
  asset: Asset
  changeTradeDirection?: boolean
  previousAmount?: BigNumber
  previousTradeDirection?: 'long' | 'short'
  previousLeverage?: number
}

export default function PerpsSummary(props: Props) {
  const openPerpPosition = useStore((s) => s.openPerpPosition)
  const currentAccount = useCurrentAccount()

  const onConfirm = useCallback(async () => {
    if (!currentAccount) return
    await openPerpPosition({
      accountId: currentAccount.id,
      coin: BNCoin.fromDenomAndBigNumber(
        props.asset.denom,
        props.amount.times(props.tradeDirection === 'short' ? -1 : 1),
      ),
    })
  }, [currentAccount, openPerpPosition, props.amount, props.asset.denom, props.tradeDirection])

  const disabled = useMemo(
    () =>
      (props.previousAmount && props.previousAmount.isEqualTo(props.amount)) ||
      props.amount.isZero(),
    [props.amount, props.previousAmount],
  )

  return (
    <div className='border border-white/10 rounded-sm bg-white/5'>
      <ManageSummary {...props} />
      <div className='py-4 px-3 flex flex-col gap-1'>
        <Text size='xs' className='font-bold mb-2'>
          Summary
        </Text>
        <SummaryLine label='Expected Price'>-</SummaryLine>
        <SummaryLine label='Fees'>-</SummaryLine>
        <SummaryLine label='Total'>-</SummaryLine>
      </div>
      <ActionButton onClick={onConfirm} disabled={disabled} className='w-full py-2.5'>
        <span className='capitalize mr-1'>{props.tradeDirection}</span>
        {props.asset.symbol}
      </ActionButton>
    </div>
  )
}

function ManageSummary(props: Props) {
  const showTradeDirection =
    props.previousTradeDirection && props.previousTradeDirection !== props.tradeDirection
  const showAmount =
    props.previousAmount && props.amount && !props.previousAmount.isEqualTo(props.amount)
  const showLeverage =
    props.previousLeverage &&
    props.leverage &&
    props.previousLeverage.toFixed(2) !== props.leverage.toFixed(2)

  if (!showTradeDirection && !showLeverage && !showAmount) return null

  return (
    <div className='pt-4 px-3 flex flex-col gap-1'>
      <Text size='xs' className='font-bold mb-2'>
        Your new position
      </Text>

      {showTradeDirection && props.previousTradeDirection && (
        <SummaryLine label='Side' contentClassName='flex gap-1'>
          <TradeDirection tradeDirection={props.previousTradeDirection} />
          <ArrowRight width={16} />
          <TradeDirection tradeDirection={props.tradeDirection} />
        </SummaryLine>
      )}

      {showAmount && props.previousAmount && (
        <SummaryLine label='Size' contentClassName='flex gap-1'>
          <AssetAmount asset={props.asset} amount={props.previousAmount.toNumber()} />
          <ArrowRight
            width={16}
            className={classNames(
              props.previousAmount.isGreaterThan(props.amount) ? 'text-error' : 'text-success',
            )}
          />
          <AssetAmount asset={props.asset} amount={props.amount.toNumber()} />
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
