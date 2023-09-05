import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  asset: Asset
  amount: BigNumber
}

export default function AmountAndValue(props: Props) {
  return (
    <div className='flex flex-col gap-[0.5] text-xs'>
      <FormattedNumber
        amount={props.amount.toNumber()}
        options={{ decimals: props.asset.decimals, abbreviated: true }}
        animate
      />
      <DisplayCurrency
        className='justify-end text-xs text-white/50'
        coin={BNCoin.fromDenomAndBigNumber(props.asset.denom, props.amount)}
      />
    </div>
  )
}
