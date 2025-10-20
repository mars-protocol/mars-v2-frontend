import classNames from 'classnames'
import { useMemo } from 'react'

import Text from 'components/common/Text'

interface Props {
  direction: TradeDirection
  onChangeDirection: (direction: TradeDirection) => void
  asset?: Asset
}

export function TradeDirectionSelector(props: Props) {
  return (
    <div className='flex rounded-sm bg-black/20'>
      <Direction
        onClick={() => props.onChangeDirection('long')}
        direction={'long'}
        isActive={props.direction === 'long'}
        asset={props.asset}
      />
      <Direction
        onClick={() => props.onChangeDirection('short')}
        direction={'short'}
        isActive={props.direction === 'short'}
        asset={props.asset}
      />
    </div>
  )
}

interface DirectionProps {
  direction: TradeDirection
  isActive: boolean
  onClick: () => void
  asset?: Asset
}
function Direction(props: DirectionProps) {
  const classString = props.direction === 'long' ? 'success' : 'error'

  const label = useMemo(() => {
    if (props.asset) {
      return props.direction === 'long' ? `Buy ${props.asset.symbol}` : `Sell ${props.asset.symbol}`
    } else {
      return props.direction === 'long' ? 'Long' : 'Short'
    }
  }, [props.asset, props.direction])

  return (
    <button
      className={classNames(
        'px-4 py-3 rounded-sm flex-1',
        props.isActive && `border text-${classString}`,

        !props.isActive && 'text-white/20 hover:text-white',
        `border-${classString}`,
      )}
      onClick={props.onClick}
    >
      <Text className={classNames('text-center first-letter:uppercase')}>{label}</Text>
    </button>
  )
}
