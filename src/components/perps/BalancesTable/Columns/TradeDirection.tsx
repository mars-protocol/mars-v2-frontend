import classNames from 'classnames'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'

export const PERP_TYPE_META = {
  accessorKey: 'tradeDirection',
  header: 'Side',
  meta: { className: 'w-30' },
}

type Props = {
  tradeDirection: TradeDirection
  className?: string
  directionChange?: boolean
  previousTradeDirection?: TradeDirection
}

export default function TradeDirection(props: Props) {
  const { tradeDirection, className, previousTradeDirection } = props
  return (
    <div className='inline-flex items-center gap-1'>
      {previousTradeDirection && (
        <>
          <Text
            size='xs'
            tag='div'
            className={classNames(
              'capitalize px-2 py-0.5 rounded-sm flex items-center',
              previousTradeDirection === 'short' && 'text-error bg-error/20',
              previousTradeDirection === 'long' && 'text-success bg-success/20',
              className,
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
          'capitalize px-2 py-0.5 rounded-sm flex items-center',
          tradeDirection === 'short' && 'text-error bg-error/20',
          tradeDirection === 'long' && 'text-success bg-success/20',
          className,
        )}
      >
        {tradeDirection}
      </Text>
    </div>
  )
}
