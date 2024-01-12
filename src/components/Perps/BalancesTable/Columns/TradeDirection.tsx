import classNames from 'classnames'

import Text from 'components/Text'

export const PERP_TYPE_META = { accessorKey: 'tradeDirection', header: 'Side' }

type Props = {
  tradeDirection: TradeDirection
}

export default function TradeDirection(props: Props) {
  const { tradeDirection } = props
  return (
    <Text
      size='xs'
      className={classNames(
        'capitalize px-1 py-0.5 rounded-sm inline-block',
        tradeDirection === 'short' && 'text-error bg-error/20',
        tradeDirection === 'long' && 'text-success bg-success/20',
      )}
    >
      {tradeDirection}
    </Text>
  )
}
