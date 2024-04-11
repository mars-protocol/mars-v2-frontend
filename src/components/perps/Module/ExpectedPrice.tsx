import BigNumber from 'bignumber.js'

import { BNCoin } from 'classes/BNCoin'
import { CircularProgress } from 'components/common/CircularProgress'
import DisplayCurrency from 'components/common/DisplayCurrency'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'

type Props = {
  denom: string
  newAmount: BigNumber
  previousAmount: BigNumber
}

export const ExpectedPrice = (props: Props) => {
  const { data: tradingFeeAndPrice, isLoading } = useTradingFeeAndPrice(
    props.denom,
    props.newAmount,
    props.previousAmount,
  )

  if (isLoading) return <CircularProgress className='h-full' size={12} />

  if (tradingFeeAndPrice?.price) {
    return <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber('usd', tradingFeeAndPrice.price)} />
  }

  return '-'
}
