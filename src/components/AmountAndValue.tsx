import { FormattedNumber } from 'components/FormattedNumber'
import TitleAndSubCell from 'components/TitleAndSubCell'
import DisplayCurrency from 'components/DisplayCurrency'

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
      sub={<DisplayCurrency coin={{ amount: props.amount, denom: props.asset.denom }} />}
      className='justify-end'
    />
  )
}
