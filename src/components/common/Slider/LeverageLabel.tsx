import classNames from 'classnames'

import Text from 'components/common/Text'

interface Props {
  className?: string
  decimals: number
  leverage: number
  style?: {}
}

export default function LeverageLabel(props: Props) {
  return (
    <div
      className={classNames(
        'flex flex-col gap-1 items-center',
        'transition-opacity duration-100',
        props.className,
      )}
      style={props.style}
    >
      <div className={classNames('h-2.5 w-px border-[0.5px] border-white/20')} />
      <Text className='text-xs text-white/50'>{props.leverage.toFixed(props.decimals)}x</Text>
    </div>
  )
}
