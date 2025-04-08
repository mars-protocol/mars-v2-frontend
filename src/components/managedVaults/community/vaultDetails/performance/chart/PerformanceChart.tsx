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

  let baseTvl = 50

  for (let i = 0; i <= days; i++) {
    const date = moment(startDate).add(i, 'days')
    const variation = (Math.random() - 0.5) * 5
    const tvl = baseTvl + variation

    data.push({
      date: date.format('YYYY-MM-DD'),
      tvl: tvl,
    })

    baseTvl += 0.5
  }

  return data
}

const lines = [
  {
    dataKey: 'tvl',
    color: '#8884d8',
    name: 'TVL',
  },
]

export default function PerformanceChart(props: Props) {
  const loading = false
  const data = generateDummyData()
  const height = 'h-80'
  const timeframe = '7d'

  return (
    <PerformanceChartWrapper title={'TVL Chart'}>
      {data === null || loading ? (
        <PerformanceChartLoading height={'h-80'} />
      ) : (
        <PerformanceChartBody data={data} lines={lines} height={height} timeframe={timeframe} />
      )}
    </PerformanceChartWrapper>
  )
}
