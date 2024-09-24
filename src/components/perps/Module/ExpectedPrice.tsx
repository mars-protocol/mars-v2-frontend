import BigNumber from 'bignumber.js'

import { CircularProgress } from 'components/common/CircularProgress'
import DisplayCurrency from 'components/common/DisplayCurrency'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import { BNCoin } from 'types/classes/BNCoin'

type Props = {
  denom: string
  newAmount: BigNumber
  className?: string
}

export const ExpectedPrice = (props: Props) => {
  const { data: tradingFeeAndPrice, isLoading } = useTradingFeeAndPrice(
    props.denom,
    props.newAmount,
  )

  if (isLoading) return <CircularProgress className='h-full' size={12} />

  if (tradingFeeAndPrice?.price) {
    return (
      <DisplayCurrency
        coin={BNCoin.fromDenomAndBigNumber('usd', tradingFeeAndPrice.price)}
        options={{ maxDecimals: tradingFeeAndPrice.price.isGreaterThan(100) ? 2 : 6 }}
        className={props.className}
      />
    )
  }

  return '-'
}
