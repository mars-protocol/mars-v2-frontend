import { FormattedNumber } from 'components/FormattedNumber'
import TitleAndSubCell from 'components/TitleAndSubCell'
import DisplayCurrency from 'components/DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  asset: Asset
  amount: BigNumber
}

export default function AmountAndValue(props: Props) {
  return (
    <TitleAndSubCell
      title={
        <FormattedNumber
          amount={props.amount.toNumber()}
          options={{ decimals: props.asset.decimals, abbreviated: true }}
          animate
        />
      }
      sub={
        <DisplayCurrency
          coin={new BNCoin({ amount: props.amount.toString(), denom: props.asset.denom })}
        />
      }
      className='justify-end'
    />
  )
}
