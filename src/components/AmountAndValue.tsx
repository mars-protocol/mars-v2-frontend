import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { MAX_AMOUNT_DECIMALS, MIN_AMOUNT } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify } from 'utils/formatters'

interface Props {
  asset: Asset
  amount: BigNumber
}

export default function AmountAndValue(props: Props) {
  const amount = demagnify(props.amount.toString(), props.asset)
  return (
    <div className='flex flex-col gap-[0.5] text-xs'>
      <FormattedNumber
        amount={amount < MIN_AMOUNT ? MIN_AMOUNT : amount}
        smallerThanThreshold={amount < MIN_AMOUNT}
        options={{ abbreviated: true, maxDecimals: MAX_AMOUNT_DECIMALS }}
        animate
      />
      <DisplayCurrency
        className='justify-end text-xs text-white/50'
        coin={BNCoin.fromDenomAndBigNumber(props.asset.denom, props.amount)}
      />
    </div>
  )
}
