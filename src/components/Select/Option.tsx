import { getMarketAssets } from 'utils/assets'
import { getTokenSymbol } from 'utils/tokens'

interface Props extends Option {
  isSelected?: boolean
  onClick?: (value: string) => void
}

export default function Option(props: Props) {
  if (props.isSelected) {
    return <div>{props.label}</div>
  }

  if (props?.denom) {
    const marketAssets = getMarketAssets()
    const coinSymbol = getTokenSymbol(props.denom, marketAssets)
    return <div onClick={() => props?.onClick && props.onClick(props.denom)}>{coinSymbol}</div>
  }

  return <div onClick={() => props?.onClick && props.onClick(props.denom)}>{props.label}</div>
}
