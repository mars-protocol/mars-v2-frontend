import { useCallback, useMemo } from 'react'

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

  const getLendingMarketDetails = useCallback(
    () => [
      {
        amount: convertAmount(asset, marketDepositAmount).toNumber(),
        options: { abbreviated: true, suffix: ` ${displayCurrencySymbol}` },
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
        title: 'Liquidation Threshold',
      },
      {
        amount: getConversionRate(asset.denom).toNumber(),
        options: { minDecimals: 2, maxDecimals: 2, suffix: ` ${displayCurrencySymbol}` },
        title: 'Oracle Price',
      },
      {
        amount: totalBorrowed.dividedBy(marketDepositAmount).multipliedBy(100).toNumber(),
        options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
        title: 'Utilization Rate',
      },
    ],
    [
      asset,
      displayCurrencySymbol,
      getConversionRate,
      marketDepositAmount,
      marketLiquidityAmount,
      marketLiquidationThreshold,
      marketMaxLtv,
      totalBorrowed,
    ],
  )

  const getBorrowMarketDetails = useCallback(
    () => [
      {
        amount: convertAmount(asset, totalBorrowed).toNumber(),
        options: { abbreviated: true, suffix: ` ${displayCurrencySymbol}` },
        title: 'Total Borrowed',
      },
      {
        amount: getConversionRate(asset.denom).toNumber(),
        options: { minDecimals: 2, maxDecimals: 2, suffix: ` ${displayCurrencySymbol}` },
        title: 'Oracle Price',
      },
      {
        amount: totalBorrowed.dividedBy(marketDepositAmount).multipliedBy(100).toNumber(),
        options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
        title: 'Utilization Rate',
      },
    ],
    [asset, displayCurrencySymbol, getConversionRate, marketDepositAmount, totalBorrowed],
  )

  const details: Detail[] = useMemo(
    () => (type === 'lend' ? getLendingMarketDetails() : getBorrowMarketDetails()),
    [type, getLendingMarketDetails, getBorrowMarketDetails],
  )

  return (
    <div className='flex flex-1 justify-between rounded-md bg-white bg-opacity-5'>
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
