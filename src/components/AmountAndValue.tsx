import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { MAX_AMOUNT_DECIMALS, MIN_AMOUNT } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify } from 'utils/formatters'

interface Props {
  asset: Asset
  amount: BigNumber
  isApproximation?: boolean
}

export default function AmountAndValue(props: Props) {
  const amount = demagnify(props.amount.toString(), props.asset)
  const isZero = amount === 0
  const isBelowMinAmount = amount < MIN_AMOUNT
  const displayAmount = isBelowMinAmount ? MIN_AMOUNT : amount
  return (
    <div className='flex flex-col gap-[0.5] text-xs text-right'>
      <FormattedNumber
        amount={isZero ? 0 : displayAmount}
        smallerThanThreshold={!isZero && isBelowMinAmount}
        options={{ abbreviated: true, maxDecimals: MAX_AMOUNT_DECIMALS }}
        animate
      />
      <DisplayCurrency
        className='justify-end text-xs text-white/50'
        coin={BNCoin.fromDenomAndBigNumber(props.asset.denom, props.amount)}
        isApproximation={props.isApproximation}
      />
    </div>
  )
}
