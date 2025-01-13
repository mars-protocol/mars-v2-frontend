import classNames from 'classnames'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export const TRADE_DIRECTION_META = {
  id: 'direction',
  accessorKey: 'tradeDirection',
  header: 'Direction',
}

interface Props {
  tradeDirection: TradeDirection
  reduce_only?: boolean
  previousTradeDirection?: TradeDirection
  className?: string
  denom?: string
  amount?: BigNumber
  type: PositionType
  showPositionEffect?: boolean
}

function getPositionEffect(
  currentPosition: PerpsPosition | undefined,
  orderDirection: TradeDirection,
  orderAmount: BigNumber,
  orderType: PositionType,
  isReduceOnly?: boolean,
): string {
  if (!currentPosition) return ''
  if (orderType === 'market') return ''

  if (currentPosition.tradeDirection === orderDirection) return 'Increase Position'

  if (isReduceOnly) {
    if (orderAmount.abs().isGreaterThan(currentPosition.amount.abs())) return 'Close Position'
    return 'Reduce Position'
  }

  if (currentPosition.tradeDirection !== orderDirection) {
    if (orderAmount.abs().isGreaterThan(currentPosition.amount.abs())) return 'Flip Position'
    if (orderAmount.abs().isEqualTo(currentPosition.amount.abs())) return 'Close Position'
    return 'Reduce Position'
  }

  return ''
}

export default function TradeDirection({
  tradeDirection,
  reduce_only,
  previousTradeDirection,
  className,
  denom,
  amount,
  type,
  showPositionEffect = false,
}: Props) {
  const currentAccount = useCurrentAccount()
  const currentPosition = currentAccount?.perps.find(byDenom(denom ?? ''))

  const positionEffect = showPositionEffect
    ? amount && denom
      ? getPositionEffect(currentPosition, tradeDirection, BN(amount), type, reduce_only)
      : ''
    : ''

  return (
    <div className={classNames('flex flex-col items-end gap-0.5', className)}>
      <div className='inline-flex items-center justify-center gap-1'>
        {previousTradeDirection && (
          <>
            <Text
              size='xs'
              tag='div'
              className={classNames(
                'capitalize px-2 py-0.5 rounded-sm flex items-center justify-center',
                previousTradeDirection === 'short' && 'text-error bg-error/20',
                previousTradeDirection === 'long' && 'text-success bg-success/20',
              )}
            >
              {previousTradeDirection}
            </Text>
            <div className='w-4'>
              <ArrowRight />
            </div>
          </>
        )}
        <Text
          size='xs'
          tag='div'
          className={classNames(
            'capitalize px-2 py-0.5 rounded-sm flex items-center justify-center',
            tradeDirection === 'short' && 'text-error bg-error/20',
            tradeDirection === 'long' && 'text-success bg-success/20',
          )}
        >
          {tradeDirection}
        </Text>
      </div>
      {positionEffect && (
        <Text size='xs' className='text-white/50'>
          {positionEffect}
        </Text>
      )}
    </div>
  )
}
