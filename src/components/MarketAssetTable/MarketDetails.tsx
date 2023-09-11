import { useMemo } from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'

interface Props {
  data: BorrowMarketTableData | LendingMarketTableData
  type: 'borrow' | 'lend'
}

interface Detail {
  amount: number
  options: FormatOptions
  title: string
}

export default function MarketDetails({ data, type }: Props) {
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

  const details: Detail[] = useMemo(() => {
    const isDollar = displayCurrencySymbol === '$'

    function getLendingMarketDetails() {
      const depositCap = (data as LendingMarketTableData).marketDepositCap
      return [
        {
          amount: convertAmount(asset, marketDepositAmount).toNumber(),
          options: {
            abbreviated: true,
            suffix: isDollar ? undefined : ` ${displayCurrencySymbol}`,
            prefix: isDollar ? '$' : undefined,
          },
          title: 'Total Supplied',
        },
        {
          amount: marketMaxLtv * 100,
          options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
          title: 'Max LTV',
        },
        {
          amount: marketLiquidationThreshold * 100,
          options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
          title: 'Liquidation LTV',
        },
        {
          amount: getConversionRate(asset.denom).toNumber(),
          options: {
            minDecimals: 2,
            maxDecimals: 2,
            suffix: isDollar ? undefined : ` ${displayCurrencySymbol}`,
            prefix: isDollar ? '$' : undefined,
          },
          title: 'Oracle Price',
        },
        {
          amount: totalBorrowed.dividedBy(depositCap).multipliedBy(100).toNumber(),
          options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
          title: 'Utilization Rate',
        },
      ]
    }

    function getBorrowMarketDetails() {
      return [
        {
          amount: convertAmount(asset, totalBorrowed).toNumber(),
          options: {
            abbreviated: true,
            suffix: isDollar ? undefined : ` ${displayCurrencySymbol}`,
            prefix: isDollar ? '$' : undefined,
          },
          title: 'Total Borrowed',
        },
        {
          amount: getConversionRate(asset.denom).toNumber(),
          options: {
            minDecimals: 2,
            maxDecimals: 2,
            suffix: isDollar ? undefined : ` ${displayCurrencySymbol}`,
            prefix: isDollar ? '$' : undefined,
          },
          title: 'Oracle Price',
        },
        {
          amount: totalBorrowed.dividedBy(marketDepositAmount).multipliedBy(100).toNumber(),
          options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
          title: 'Utilization Rate',
        },
      ]
    }

    if (type === 'lend') return getLendingMarketDetails()
    return getBorrowMarketDetails()
  }, [
    data,
    type,
    asset,
    marketDepositAmount,
    marketMaxLtv,
    marketLiquidationThreshold,
    totalBorrowed,
    displayCurrencySymbol,
    convertAmount,
    getConversionRate,
  ])

  return (
    <div className='flex justify-between flex-1 bg-white rounded-md bg-opacity-5'>
      {details.map((detail, index) => (
        <TitleAndSubCell
          key={index}
          className='text-center'
          containerClassName='m-5 ml-10 mr-10 space-y-1'
          title={
            <FormattedNumber
              className='text-xs text-center'
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
