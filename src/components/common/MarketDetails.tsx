import { Row } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import DynamicLineChart from 'components/common/DynamicLineChart'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useAssetApr from 'hooks/markets/useAssetApr'
import useDisplayCurrencyPrice from 'hooks/prices/useDisplayCurrencyPrice'

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

  const { asset, ltv, deposits, debt, borrowEnabled } = row.original

  const details: Detail[] = useMemo(() => {
    const isDollar = displayCurrencySymbol === '$'

    function getLendingMarketDetails() {
      return [
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
          amount: debt.isZero() ? 0 : debt.dividedBy(deposits).multipliedBy(100).toNumber(),
          options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
          title: 'Utilization Rate',
        },
      ]
    }

    function getBorrowMarketDetails() {
      return [
        {
          amount: convertAmount(asset, debt).toNumber(),
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
          amount: debt.isZero() ? 0 : debt.dividedBy(deposits).multipliedBy(100).toNumber(),
          options: { minDecimals: 2, maxDecimals: 2, suffix: '%' },
          title: 'Utilization Rate',
        },
      ]
    }

    if (type === 'lend') return getLendingMarketDetails()
    return getBorrowMarketDetails()
  }, [
    displayCurrencySymbol,
    type,
    convertAmount,
    asset,
    debt,
    ltv.max,
    ltv.liq,
    getConversionRate,
    deposits,
  ])

  const intervalOptions = [
    { label: '24H', granularity: 'hour', unit: 24 },
    { label: '7D', granularity: 'day', unit: 7 },
    { label: '30D', granularity: 'day', unit: 30 },
    { label: '90D', granularity: 'day', unit: 90 },
  ]

  const [selectedInterval, setSelectedInterval] = useState(intervalOptions[2])
  const { data: aprData, isLoading: aprLoading } = useAssetApr({
    denom: asset.denom,
    granularity: selectedInterval.granularity,
    unit: selectedInterval.unit,
  })

  const chartData = useMemo(() => {
    return [...aprData].reverse()
  }, [aprData])

  return (
    <tr>
      <td
        colSpan={row.getAllCells().length}
        className='p-4 border-b gradient-header border-white/10'
      >
        <div className='flex justify-between flex-1 rounded-md bg-white/5'>
          {details.map((detail, index) => (
            <TitleAndSubCell
              key={index}
              className='text-center'
              containerClassName='m-5 mx-auto space-y-1'
              title={
                <FormattedNumber
                  className='text-xs text-center'
                  amount={detail.amount}
                  options={detail.options}
                />
              }
              sub={detail.title}
            />
          ))}
        </div>
        {borrowEnabled && (
          <div className='mt-4'>
            <div className='flex justify-end gap-2 mb-2 px-2'>
              {intervalOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedInterval(opt)
                  }}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedInterval.label === opt.label
                      ? 'bg-white/10 text-white'
                      : 'text-white/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <DynamicLineChart
              data={chartData || []}
              loading={aprLoading}
              lines={[
                { dataKey: 'supply_apr', color: '#10b981', name: 'Supply APR', isPercentage: true },
                { dataKey: 'borrow_apr', color: '#3b82f6', name: 'Borrow APR', isPercentage: true },
              ]}
              timeframe={selectedInterval.granularity === 'hour' ? '24' : ''}
              height='h-40'
              title=''
            />
          </div>
        )}
      </td>
    </tr>
  )
}
