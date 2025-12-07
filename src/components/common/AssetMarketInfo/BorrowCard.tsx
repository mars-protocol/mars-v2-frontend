import useMarket from 'hooks/markets/useMarket'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import Text from 'components/common/Text'
import DynamicLineChart from '../DynamicLineChart'
import useAssetApr from 'hooks/markets/useAssetApr'
import { useMemo, useState } from 'react'
import { convertAprToApy } from 'utils/parsers'
import { FormattedNumber } from '../FormattedNumber'
import classNames from 'classnames'

const intervalOptions = [
  { label: '24H', granularity: 'hour', unit: 24 },
  { label: '7D', granularity: 'day', unit: 7 },
  { label: '30D', granularity: 'day', unit: 30 },
  { label: '90D', granularity: 'day', unit: 90 },
]

export default function BorrowCard({ asset }: { asset: Asset }) {
  const market = useMarket(asset.denom)

  const [selectedInterval, setSelectedInterval] = useState(intervalOptions[2])
  const { data: aprData, isLoading: aprLoading } = useAssetApr({
    denom: asset.denom,
    granularity: selectedInterval.granularity,
    unit: selectedInterval.unit,
  })

  // Fetch 7-day data for change calculation
  const { data: aprData7d } = useAssetApr({
    denom: asset.denom,
    granularity: 'day',
    unit: 7,
  })

  const sevenDayChange = useMemo(() => {
    if (!aprData7d || aprData7d.length === 0) {
      return null
    }

    // Most recent APY (last item in array)
    const currentApy = aprData7d[aprData7d.length - 1]?.supply_apr
      ? convertAprToApy(Number(aprData7d[aprData7d.length - 1].supply_apr), 365)
      : null

    // APY from 7 days ago (first item in array)
    const sevenDaysAgoApy = aprData7d[0]?.supply_apr
      ? convertAprToApy(Number(aprData7d[0].supply_apr), 365)
      : null

    if (currentApy === null || sevenDaysAgoApy === null) {
      return null
    }

    return currentApy - sevenDaysAgoApy
  }, [aprData7d])

  const chartData = useMemo(() => {
    if (!aprData || aprData.length === 0) {
      return []
    }
    return [...aprData].reverse().map((item) => ({
      ...item,
      supply_apy: item.supply_apr ? convertAprToApy(Number(item.supply_apr), 365) : null,
    }))
  }, [aprData])

  return (
    <Card
      title={
        <div className='flex items-center justify-between w-full px-4 py-3'>
          <div className='flex gap-4 items-end'>
            <Text size='2xl' className='text-white'>
              Borrow
            </Text>
            {market && (
              <div className='flex gap-1 items-end'>
                <FormattedNumber
                  amount={market.apy.deposit}
                  options={{ suffix: '% APY', minDecimals: 2, maxDecimals: 2 }}
                  className='text-2xl'
                />
                {sevenDayChange !== null && (
                  <FormattedNumber
                    amount={Math.abs(sevenDayChange)}
                    options={{
                      suffix: '% (7d)',
                      minDecimals: 2,
                      maxDecimals: 2,
                      prefix: sevenDayChange >= 0 ? '+' : '-',
                    }}
                    className={classNames(
                      'text-xs',
                      sevenDayChange >= 0 ? 'text-profit' : 'text-loss',
                    )}
                  />
                )}
              </div>
            )}
          </div>
          <Button text='Borrow' size='sm' color='primary'>
            Borrow
          </Button>
        </div>
      }
      contentClassName='p-4'
      className='w-full'
    >
      <div className='flex flex-col gap-2'>
        {market && (
          <div className='flex gap-4 justify-between px-8'>
            <div>
              <FormattedNumber
                amount={market.apy.deposit}
                options={{ suffix: '%', minDecimals: 2, maxDecimals: 2 }}
                className='text-xl'
              />
              <Text size='xs' className='text-white/50'>
                Max LTV
              </Text>
            </div>
            <div>
              <FormattedNumber
                amount={market.apy.deposit}
                options={{ suffix: '%', minDecimals: 2, maxDecimals: 2 }}
                className='text-xl'
              />
              <Text size='xs' className='text-white/50'>
                Liquidation LTV
              </Text>
            </div>
            <div>
              <FormattedNumber
                amount={market.apy.deposit}
                options={{ suffix: '%', minDecimals: 2, maxDecimals: 2 }}
                className='text-xl'
              />
              <Text size='xs' className='text-white/50'>
                Utilization Rate
              </Text>
            </div>
          </div>
        )}

        <DynamicLineChart
          data={chartData || []}
          loading={aprLoading}
          lines={[
            { dataKey: 'supply_apy', color: '#10b981', name: 'Supply APY', isPercentage: true },
          ]}
          timeframe={selectedInterval.granularity === 'hour' ? '24' : ''}
          height='h-40'
          title=''
          legend={false}
        />
      </div>
      <div className='flex gap-4 justify-between px-8 mt-4'>
        <div className='flex flex-col gap-1'>
          <FormattedNumber
            amount={55}
            options={{ prefix: '$', minDecimals: 2, maxDecimals: 2 }}
            className='text-xl'
          />
          <Text size='xs' className='text-white/50'>
            Deposit Cap
          </Text>
        </div>
        <div className='flex flex-col gap-1'>
          <FormattedNumber
            amount={55}
            options={{ prefix: '$', minDecimals: 2, maxDecimals: 2 }}
            className='text-xl'
          />
          <Text size='xs' className='text-white/50'>
            Total Deposits
          </Text>
        </div>
        <div className='flex flex-col gap-1'>
          <FormattedNumber
            amount={55}
            options={{ prefix: '$', minDecimals: 2, maxDecimals: 2 }}
            className='text-xl'
          />
          <Text size='xs' className='text-white/50'>
            Remaining Capacity
          </Text>
        </div>
      </div>
      {/* Progress Bar */}
      <div className='px-8 mt-4'>
        {(() => {
          // Mock data - will be replaced with real data later
          const depositCap = 1000000 // $1M
          const totalDeposits = 749000 // $749K
          const percentageUsed = (totalDeposits / depositCap) * 100

          return (
            <div className='flex flex-col gap-1'>
              <div className='relative w-full h-2 rounded-full overflow-hidden bg-white/5'>
                <div
                  className='absolute left-0 top-0 h-full rounded-full bg-white/20 transition-all duration-300'
                  style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                />
              </div>
              <div className='flex justify-end'>
                <Text size='xs' className='text-white/50'>
                  {percentageUsed.toFixed(1)}% used
                </Text>
              </div>
            </div>
          )
        })()}
      </div>
    </Card>
  )
}
