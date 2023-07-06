import { FormattedNumber } from 'components/FormattedNumber'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'
import { BN } from 'utils/helpers'

interface Props {
  data: LendingMarketTableData
}

interface Details {
  amount: BigNumber
  options: FormatOptions
  title: string
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

  const totalBorrowed = marketDepositAmount.minus(marketLiquidityAmount)

  const details: Details[] = [
    {
      amount: convertAmount(asset, marketDepositAmount),
      options: { abbreviated: true, suffix: ` ${displayCurrencySymbol}` },
      title: 'Total Supplied',
    },
    {
      amount: BN(marketMaxLtv).multipliedBy(100),
      options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
      title: 'Max LTV',
    },
    {
      amount: BN(marketLiquidationThreshold).multipliedBy(100),
      options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
      title: 'Liquidation Threshold',
    },
    {
      amount: getConversionRate(asset.denom),
      options: { minDecimals: 2, maxDecimals: 2, suffix: ` ${displayCurrencySymbol}` },
      title: 'Oracle Price',
    },
    {
      amount: totalBorrowed.dividedBy(marketDepositAmount).multipliedBy(100),
      options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
      title: 'Utilization Rate',
    },
  ]

  return (
    <div className='flex flex-1 justify-center rounded-md bg-white bg-opacity-5'>
      {details.map((detail, index) => (
        <TitleAndSubCell
          key={index}
          className='text-center'
          containerClassName='m-5 ml-10 mr-10 space-y-1'
          title={
            <FormattedNumber
              className='text-center text-xs'
              amount={detail.amount}
              options={detail.options}
              animate
            />
          }
          sub={detail.title}
        />
      ))}
    </div>
  )
}

export default LendingDetails
