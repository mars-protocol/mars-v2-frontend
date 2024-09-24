import BigNumber from 'bignumber.js'

import { CircularProgress } from 'components/common/CircularProgress'
import DisplayCurrency from 'components/common/DisplayCurrency'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import { BNCoin } from 'types/classes/BNCoin'

type Props = {
  denom: string
  newAmount: BigNumber
  previousAmount: BigNumber
  className?: string
  showPrefix?: boolean
}

export default function TradingFee(props: Props) {
  const { data: tradingFeeAndPrice, isLoading } = useTradingFeeAndPrice(
    props.denom,
    props.newAmount,
    props.previousAmount,
  )

  if (isLoading) return <CircularProgress className='h-full' size={12} />
  if (props.newAmount.isEqualTo(props.previousAmount) || !tradingFeeAndPrice?.fee) return '-'

  const fee = tradingFeeAndPrice.fee.opening.plus(tradingFeeAndPrice.fee.closing)
  return (
    <DisplayCurrency
      coin={BNCoin.fromDenomAndBigNumber(
        tradingFeeAndPrice.baseDenom,
        props.showPrefix ? fee.negated() : fee,
      )}
      className={props.className}
      showSignPrefix={!!props.showPrefix}
    />
  )
}
