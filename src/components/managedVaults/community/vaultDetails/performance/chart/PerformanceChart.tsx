import PerformanceChartWrapper from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChartWrapper'
import PerformanceChartLoading from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChartLoading'
import PerformanceChartBody from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChartBody'
import { useState } from 'react'
import useHistoricalVaultData from 'hooks/managedVaults/useHistoricalVaultData'
import Text from 'components/common/Text'

interface ChartLine {
  dataKey: string
  color: string
  name: string
  isCurrency?: boolean
  isPercentage?: boolean
}

interface Props {
  vaultAddress: string
}

const tvlLine: ChartLine = {
  dataKey: 'tvl',
  color: '#8884d8',
  name: 'Vault Balance',
  isCurrency: true,
}

const apyLine: ChartLine = {
  dataKey: 'apy',
  color: '#82ca9d',
  name: 'APY',
  isPercentage: true,
}

const sharePriceLine: ChartLine = {
  dataKey: 'sharePrice',
  color: '#ffc658',
  name: 'Share Price',
}

export default function PerformanceChart(props: Props) {
  const { vaultAddress } = props
  const [timeframe, setTimeframe] = useState(30)
  const { data, isLoading, error } = useHistoricalVaultData(vaultAddress, timeframe)

  const charts = [
    {
      title: 'Vault Balance',
      lines: [tvlLine],
    },
    {
      title: 'APY',
      lines: [apyLine],
    },
    {
      title: 'Share Price',
      lines: [sharePriceLine],
    },
  ]

  const hasData = data && data.length > 0

  const renderChartContent = (lines: ChartLine[]) => {
    if (isLoading) {
      return <PerformanceChartLoading />
    }

    if (error || !hasData) {
      return (
        <Text size='sm' className='text-center text-white/60'>
          Failed to load chart data. Please try again later.
        </Text>
      )
    }

    return <PerformanceChartBody data={data} lines={lines} />
  }

  return (
    <PerformanceChartWrapper
      charts={charts.map((chart) => ({
        title: chart.title,
        content: renderChartContent(chart.lines),
      }))}
      timeframe={timeframe}
      setTimeframe={setTimeframe}
    />
  )
}
