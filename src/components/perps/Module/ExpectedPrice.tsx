import { CircularProgress } from 'components/common/CircularProgress'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getPriceDecimals } from 'utils/formatters'

type Props = {
  denom: string
  newAmount: BigNumber
  className?: string
  override?: BigNumber
}

export const ExpectedPrice = (props: Props) => {
  const { denom, newAmount, className, override } = props
  const perpsAssets = usePerpsEnabledAssets()
  const { data: tradingFeeAndPrice, isLoading } = useTradingFeeAndPrice(denom, newAmount)
  const perpsAsset = perpsAssets.find(byDenom(denom))
  if (isLoading) return <CircularProgress className='h-full' size={12} />
  if (!tradingFeeAndPrice?.price || !perpsAsset) return '-'

  const price = tradingFeeAndPrice.price.shiftedBy(perpsAsset.decimals - PRICE_ORACLE_DECIMALS)

  return (
    <DisplayCurrency
      coin={BNCoin.fromDenomAndBigNumber('usd', override ? override : price)}
      options={{ maxDecimals: getPriceDecimals(override ? override : price), abbreviated: false }}
      className={className}
    />
  )
}
