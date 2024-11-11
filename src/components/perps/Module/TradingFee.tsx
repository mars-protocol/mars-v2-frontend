import { CircularProgress } from 'components/common/CircularProgress'
import DisplayCurrency from 'components/common/DisplayCurrency'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import { BNCoin } from 'types/classes/BNCoin'
import { getPerpsPriceDecimals } from 'utils/formatters'

type Props = {
  denom: string
  newAmount: BigNumber
  previousAmount: BigNumber
  className?: string
  showPrefix?: boolean
  keeperFee?: BNCoin
}

export default function TradingFee(props: Props) {
  const { denom, newAmount, previousAmount, className, showPrefix, keeperFee } = props
  const {
    data: tradingFeeAndPrice,
    isValidating,
    isLoading,
  } = useTradingFeeAndPrice(denom, newAmount)

  if (isValidating || isLoading) return <CircularProgress className='h-full' size={12} />
  if (newAmount.isEqualTo(previousAmount) || !tradingFeeAndPrice?.fee) return '-'

  const fee = tradingFeeAndPrice.fee.opening
    .plus(tradingFeeAndPrice.fee.closing)
    .plus(keeperFee?.amount ?? 0)

  return (
    <DisplayCurrency
      coin={BNCoin.fromDenomAndBigNumber(
        tradingFeeAndPrice.baseDenom,
        showPrefix ? fee.negated() : fee,
      )}
      className={className}
      showSignPrefix={!!showPrefix}
      showDetailedPrice
      options={{
        maxDecimals: getPerpsPriceDecimals(fee),
        abbreviated: false,
      }}
    />
  )
}
