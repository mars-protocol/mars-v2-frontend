import classNames from 'classnames'

import Text from 'components/Text'

interface Props {
  direction: OrderDirection
  onChangeDirection: (direction: OrderDirection) => void
  asset?: Asset
}

export function DirectionSelect(props: Props) {
  const hasAsset = props.asset
  const directions: OrderDirection[] = hasAsset ? ['buy', 'sell'] : ['long', 'short']
  return (
    <div className='flex rounded-sm bg-black/20'>
      <Direction
        onClick={() => props.onChangeDirection(directions[0])}
        direction={directions[0]}
        isActive={props.direction === directions[0]}
        asset={props.asset}
      />
      <Direction
        onClick={() => props.onChangeDirection(directions[1])}
        direction={directions[1]}
        isActive={props.direction === directions[1]}
        asset={props.asset}
      />
    </div>
  )
}

interface DirectionProps {
  direction: 'long' | 'short' | 'buy' | 'sell'
  isActive: boolean
  onClick: () => void
  asset?: Asset
}
function Direction(props: DirectionProps) {
  const classString = props.direction === 'long' || props.direction === 'buy' ? 'success' : 'error'
  return (
    <button
      className={classNames(
        'px-4 py-3 rounded-sm flex-1',
        props.isActive && 'border bg-white/10',
        `border-${classString}`,
      )}
      onClick={props.onClick}
    >
      <Text
        className={classNames(
          'text-center first-letter:uppercase',
          props.isActive ? `text-${classString}` : 'text-white/20',
        )}
      >
        {props.asset ? `${props.direction} ${props.asset.symbol}` : props.direction}
      </Text>
    </button>
  )
}
