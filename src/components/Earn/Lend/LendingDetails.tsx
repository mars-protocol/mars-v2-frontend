import TitleAndSubCell from 'components/TitleAndSubCell'
import { formatPercent, formatValue } from 'utils/formatters'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'

interface Props {
  data: LendingMarketTableData
}

function LendingDetails({ data }: Props) {
  const {
    convertAmount,
    getConversionRate,
    symbol: displayCurrencySymbol,
  } = useDisplayCurrencyPrice()
  const {
    asset,
    marketMaxLtv,
    marketDepositAmount,
    marketLiquidityAmount,
    marketLiquidationThreshold,
  } = data
  const formattedTotalSuppliedValue = formatValue(
    convertAmount(asset, marketDepositAmount).toNumber(),
    {
      abbreviated: true,
      suffix: ` ${displayCurrencySymbol}`,
    },
  )
  const formattedPrice = formatValue(getConversionRate(asset.denom).toNumber(), {
    maxDecimals: 2,
    suffix: ` ${displayCurrencySymbol}`,
  })
  const totalBorrowed = marketDepositAmount.minus(marketLiquidityAmount)
  const utilizationRatePercent = formatPercent(
    totalBorrowed.dividedBy(marketDepositAmount).toNumber(),
    2,
  )

  const details = [
    { info: formattedTotalSuppliedValue, title: 'Total Supplied' },
    { info: formatPercent(marketMaxLtv, 2), title: 'Max LTV' },
    { info: formatPercent(marketLiquidationThreshold, 2), title: 'Liquidation Threshold' },
    { info: formattedPrice, title: 'Oracle Price' },
    { info: utilizationRatePercent, title: 'Utilization Rate' },
  ]

  return (
    <div className='flex flex-1 justify-center rounded-md bg-white bg-opacity-5'>
      {details.map((detail, index) => (
        <TitleAndSubCell
          key={index}
          className='text-md text-center'
          containerClassName='m-5 ml-10 mr-10 space-y-2'
          title={detail.info}
          sub={detail.title}
        />
      ))}
    </div>
  )
}

export default LendingDetails
