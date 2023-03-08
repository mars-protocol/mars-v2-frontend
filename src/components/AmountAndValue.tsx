import { FormattedNumber } from 'components/FormattedNumber'
import TitleAndSubCell from 'components/TitleAndSubCell'

interface Props {
  asset: Asset
  amount: string
}

export default function AmountAndValue(props: Props) {
  return (
    <TitleAndSubCell
      title={
        <FormattedNumber
          amount={props.amount}
          options={{ decimals: props.asset.decimals, abbreviated: true }}
        />
      }
      sub={
        <FormattedNumber
          amount={props.amount}
          options={{ prefix: '$', abbreviated: true, decimals: props.asset.decimals }}
        />
      }
      className='justify-end'
    />
  )
}
