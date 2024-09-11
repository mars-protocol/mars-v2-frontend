import classNames from 'classnames'

import Text from 'components/common/Text'

export const PERP_TYPE_META = { accessorKey: 'tradeDirection', header: 'Side' }

type Props = {
  tradeDirection: TradeDirection
  className?: string
  directionChange?: boolean
}

export default function TradeDirection(props: Props) {
  const { tradeDirection, className } = props
  return (
    <Text
      size='xs'
      className={classNames(
        'capitalize px-2 py-0.5 rounded-sm inline-block',
        tradeDirection === 'short' && 'text-error bg-error/20',
        tradeDirection === 'long' && 'text-success bg-success/20',
        className,
      )}
    >
      {tradeDirection}
    </Text>
  )
}
