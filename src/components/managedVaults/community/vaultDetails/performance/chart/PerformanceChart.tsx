import PerformanceChartWrapper from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChartWrapper'
import PerformanceChartLoading from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChartLoading'
import PerformanceChartBody from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChartBody'
import moment from 'moment'
import { useState } from 'react'

interface Props {}

// temp solution for now
function generateDummyData(timeframe: string) {
  const data = []
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
  const startDate = moment().subtract(days, 'days')
  const endDate = moment()

  let baseTvl = 20
  let baseApy = 15

  for (let i = 0; i <= days; i++) {
    const date = moment(startDate).add(i, 'days')
    const tvlVariation = (Math.random() - 0.3) * 2
    const apyVariation = (Math.random() - 0.3) * 5
    const tvl = baseTvl + tvlVariation
    const apy = baseApy + apyVariation

    data.push({
      date: date.format('YYYY-MM-DD'),
      tvl: tvl,
      apy: apy,
    })

    baseTvl += 5.7
    baseApy += 2
  }

  return data
}

const tvlLine = {
  dataKey: 'tvl',
  color: '#8884d8',
  name: 'Total Value',
  valueFormatter: (value: number) => `$${value.toFixed(2)}`,
}

const apyLine = {
  dataKey: 'apy',
  color: '#82ca9d',
  name: 'APY',
  valueFormatter: (value: number) => `${value.toFixed(2)}%`,
}

export default function PerformanceChart(props: Props) {
  const [timeframe, setTimeframe] = useState('7d')
  const loading = false
  const data = generateDummyData(timeframe)
  const height = 'h-80'

  return (
    <PerformanceChartWrapper
      charts={[
        {
          title: 'Vault Balance',
          content: (
            <>
              {data === null || loading ? (
                <PerformanceChartLoading height={height} />
              ) : (
                <PerformanceChartBody
                  data={data}
                  lines={[tvlLine]}
                  height={height}
                  timeframe={timeframe}
                />
              )}
            </>
          ),
        },
        {
          title: 'APY',
          content: (
            <>
              {data === null || loading ? (
                <PerformanceChartLoading height={height} />
              ) : (
                <PerformanceChartBody
                  data={data}
                  lines={[apyLine]}
                  height={height}
                  timeframe={timeframe}
                />
              )}
            </>
          ),
        },
      ]}
      timeframe={timeframe}
      setTimeframe={setTimeframe}
    />
  )
}
