import classNames from 'classnames'

import { getMarketAssets } from 'utils/assets'
import { getTokenSymbol } from 'utils/tokens'

interface Props extends Option {
  isSelected?: boolean
  isDisplay?: boolean
  onClick?: (value: string) => void
}

const optionClasses = 'block p-3 hover:cursor-pointer'

export default function Option(props: Props) {
  const marketAssets = getMarketAssets()

  if (props.isDisplay) {
    return (
      <div className={classNames('bg-white/10', optionClasses)}>
        {getTokenSymbol(props.denom, marketAssets) ?? props.label}
      </div>
    )
  }

  if (props?.denom) {
    const coinSymbol = getTokenSymbol(props.denom, marketAssets)
    return (
      <div
        className={classNames(
          'hover:bg-white/20 ',
          optionClasses,
          props.isSelected && 'bg-white/10',
        )}
        onClick={() => props?.onClick && props.onClick(props.denom)}
      >
        {coinSymbol}
      </div>
    )
  }

  return (
    <div
      className={classNames('hover:bg-white/20', optionClasses, props.isSelected && 'bg-white/10')}
      onClick={() => props?.onClick && props.onClick(props.value)}
    >
      {props.label}
    </div>
  )
}
