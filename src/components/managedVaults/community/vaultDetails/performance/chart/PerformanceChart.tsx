import PerformanceChartWrapper from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChartWrapper'
import PerformanceChartLoading from './PerformanceChartLoading'
import PerformanceChartBody from './PerformanceChartBody'
import moment from 'moment'

interface Props {}

// temp solution for now
function generateDummyData() {
  const data = []
  const startDate = moment().subtract(7, 'days')
  const endDate = moment()
  const days = endDate.diff(startDate, 'days')

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
  const loading = false
  const data = generateDummyData()
  const height = 'h-80'
  const timeframe = '7d'

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
    />
  )
}
