import BigNumber from 'bignumber.js'

import { CircularProgress } from 'components/common/CircularProgress'
import DisplayCurrency from 'components/common/DisplayCurrency'
import useTradingFee from 'hooks/perps/useTradingFee'

type Props = {
  denom: string
  amount: BigNumber
}

export default function TradingFee(props: Props) {
  const { data: openingFee, isLoading } = useTradingFee(props.denom, props.amount)

  if (isLoading) return <CircularProgress className='h-full' size={12} />
  if (props.amount.isZero() || !openingFee) return '-'

  return <DisplayCurrency coin={openingFee.fee} />
}
