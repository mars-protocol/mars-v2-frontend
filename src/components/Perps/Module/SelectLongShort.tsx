import classNames from 'classnames'

import Text from 'components/Text'

interface Props {
  direction: OrderDirection
  onChangeDirection: (direction: OrderDirection) => void
}

export function SelectLongShort(props: Props) {
  return (
    <div className='flex bg-black/20 rounded-sm'>
      <Direction
        onClick={() => props.onChangeDirection('long')}
        direction='long'
        isActive={props.direction === 'long'}
      />
      <Direction
        onClick={() => props.onChangeDirection('short')}
        direction='short'
        isActive={props.direction === 'short'}
      />
    </div>
  )
}

interface DirectionProps {
  direction: 'long' | 'short'
  isActive: boolean
  onClick: () => void
}
function Direction(props: DirectionProps) {
  return (
    <button
      className={classNames(
        'px-4 py-3 rounded-sm flex-1',
        borderColors[props.direction],
        props.isActive && 'border bg-white/10',
      )}
      onClick={props.onClick}
    >
      <Text
        className={classNames(
          'text-center capitalize',
          props.isActive ? directionColors[props.direction] : 'text-white/20',
        )}
      >
        {props.direction}
      </Text>
    </button>
  )
}

const directionColors = {
  long: 'text-success',
  short: 'text-error',
}

const borderColors = {
  long: 'border-success',
  short: 'border-error',
}
