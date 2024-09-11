import BigNumber from 'bignumber.js'

import useTradingFeeAndPrice from '../../../hooks/perps/useTradingFeeAndPrice'
import { BNCoin } from '../../../types/classes/BNCoin'
import { CircularProgress } from '../../common/CircularProgress'
import DisplayCurrency from '../../common/DisplayCurrency'

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
