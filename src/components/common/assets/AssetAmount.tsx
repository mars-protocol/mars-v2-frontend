import { FormattedNumber } from 'components/common/FormattedNumber'

type Props = {
  asset: Asset
  amount: number
  className?: string
}
export default function AssetAmount(props: Props) {
  return (
    <FormattedNumber
      amount={props.amount}
      options={{
        decimals: props.asset.decimals,
        maxDecimals: props.asset.decimals,
        suffix: ` ${props.asset.symbol}`,
      }}
      className={props.className}
    />
  )
}
