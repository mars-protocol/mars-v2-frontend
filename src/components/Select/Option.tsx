import { getMarketAssets } from 'utils/assets'
import { getTokenSymbol } from 'utils/tokens'

interface Props extends Option {
  onClick: (value: string) => void
}

export default function Option(props: Props) {
  if (props?.denom) {
    const marketAssets = getMarketAssets()
    const coinSymbol = getTokenSymbol(props.denom, marketAssets)

    return <div onClick={() => props.onClick(props.denom)}>{coinSymbol}</div>
  } else {
    return <div onClick={() => props.onClick(props.value)}>{props.label}</div>
  }
}
