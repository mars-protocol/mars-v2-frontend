import classNames from 'classnames'
import { CircularProgress } from 'components/common/CircularProgress'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { Tooltip } from 'components/common/Tooltip'
import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getPerpsPriceDecimals } from 'utils/formatters'

type Props = {
  denom: string
  newAmount: BigNumber
  className?: string
  override?: BigNumber
  tradeDirection: TradeDirection
}

export const ExpectedPrice = (props: Props) => {
  const { denom, newAmount, className, override, tradeDirection } = props
  const perpsAssets = usePerpsEnabledAssets()
  const { data: tradingFeeAndPrice, isLoading } = useTradingFeeAndPrice(denom, newAmount)
  const perpsAsset = perpsAssets.find(byDenom(denom))

  if (isLoading) return <CircularProgress className='h-full' size={12} />
  if (!tradingFeeAndPrice?.price || !perpsAsset) return '-'

  const price = tradingFeeAndPrice.price.shiftedBy(perpsAsset.decimals - PRICE_ORACLE_DECIMALS)
  const currentPrice = perpsAsset.price?.amount ?? BN_ZERO

  const priceDiff = price.minus(currentPrice).div(currentPrice).times(100)
  const isPriceEqual = priceDiff.abs().isLessThan(0.01)
  const isPositiveDiff = priceDiff.isGreaterThan(0)

  const isFavorablePrice =
    (tradeDirection === 'long' && !isPositiveDiff) || (tradeDirection === 'short' && isPositiveDiff)

  const diffColor = isPriceEqual ? 'text-white' : isFavorablePrice ? 'text-success' : 'text-error'

  return (
    <div className='flex items-center gap-2'>
      <DisplayCurrency
        coin={BNCoin.fromDenomAndBigNumber('usd', override ? override : price)}
        options={{
          maxDecimals: getPerpsPriceDecimals(override ? override : price),
          abbreviated: false,
        }}
        className={className}
        showDetailedPrice
      />
      <Tooltip
        content='Price difference from current market price'
        type='info'
        className='flex items-center'
      >
        <span className={classNames(className, diffColor)}>
          ({isPositiveDiff ? '+' : ''}
          {priceDiff.toFixed(2)}%)
        </span>
      </Tooltip>
    </div>
  )
}
