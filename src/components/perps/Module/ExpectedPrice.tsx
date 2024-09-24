import BigNumber from 'bignumber.js'

import { CircularProgress } from 'components/common/CircularProgress'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

type Props = {
  denom: string
  newAmount: BigNumber
  className?: string
}

export const ExpectedPrice = (props: Props) => {
  const perpsAssets = usePerpsEnabledAssets()
  const { data: tradingFeeAndPrice, isLoading } = useTradingFeeAndPrice(
    props.denom,
    props.newAmount,
  )
  const perpsAsset = perpsAssets.find(byDenom(props.denom))
  if (isLoading) return <CircularProgress className='h-full' size={12} />
  if (!tradingFeeAndPrice?.price || !perpsAsset) return '-'

  const price = tradingFeeAndPrice.price.shiftedBy(perpsAsset.decimals - PRICE_ORACLE_DECIMALS)

  return (
    <DisplayCurrency
      coin={BNCoin.fromDenomAndBigNumber('usd', price)}
      options={{ maxDecimals: price.isGreaterThan(100) ? 2 : 6, abbreviated: false }}
      className={props.className}
    />
  )
}
