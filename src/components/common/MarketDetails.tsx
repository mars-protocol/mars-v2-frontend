import { Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'

interface Props {
  row: Row<BorrowMarketTableData | LendingMarketTableData>
  type: 'borrow' | 'lend'
}

interface Detail {
  amount: number
  options: FormatOptions
  title: string
}

export default function MarketDetails({ row, type }: Props) {
  const {
    convertAmount,
    getConversionRate,
    symbol: displayCurrencySymbol,
  } = useDisplayCurrencyPrice()

  const { asset, ltv, marketDepositAmount, marketLiquidityAmount } = row.original

  const totalBorrowed = marketDepositAmount.minus(marketLiquidityAmount)

  const details: Detail[] = useMemo(() => {
    const isDollar = displayCurrencySymbol === '$'

    function getLendingMarketDetails() {
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
          amount: ltv.max * 100,
          options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
          title: 'Max LTV',
        },
        {
          amount: ltv.liq * 100,
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
          amount: totalBorrowed.isZero()
            ? 0
            : totalBorrowed.dividedBy(marketDepositAmount).multipliedBy(100).toNumber(),
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
          amount: totalBorrowed.isZero()
            ? 0
            : totalBorrowed.dividedBy(marketDepositAmount).multipliedBy(100).toNumber(),
          options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
          title: 'Utilization Rate',
        },
      ]
    }

    if (type === 'lend') return getLendingMarketDetails()
    return getBorrowMarketDetails()
  }, [
    type,
    asset,
    marketDepositAmount,
    ltv,
    totalBorrowed,
    displayCurrencySymbol,
    convertAmount,
    getConversionRate,
  ])

  return (
    <tr>
      <td colSpan={row.getAllCells().length} className='p-4 border-b bg-black/20 border-white/10'>
        <div className='flex justify-between flex-1 rounded-md bg-white/5'>
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
      </td>
    </tr>
  )
}
