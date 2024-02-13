import BigNumber from 'bignumber.js'

import { CircularProgress } from 'components/common/CircularProgress'
import DisplayCurrency from 'components/common/DisplayCurrency'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'

type Props = {
  denom: string
  newAmount: BigNumber
  previousAmount: BigNumber
}

export default function TradingFee(props: Props) {
  const { data: tradingFeeAndPrice, isLoading } = useTradingFeeAndPrice(
    props.denom,
    props.newAmount,
    props.previousAmount,
  )

  if (isLoading) return <CircularProgress className='h-full' size={12} />
  if (props.newAmount.isEqualTo(props.previousAmount) || !tradingFeeAndPrice?.fee) return '-'

  return <DisplayCurrency coin={tradingFeeAndPrice.fee} />
}
