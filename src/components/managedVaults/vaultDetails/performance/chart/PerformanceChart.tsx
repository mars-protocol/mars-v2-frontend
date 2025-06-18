import { useState } from 'react'
import useHistoricalVaultData from 'hooks/managedVaults/useHistoricalVaultData'
import Text from 'components/common/Text'
import AreaChartLoading from 'components/common/DynamicLineChart/AreaChartLoading'
import { TimeframeOption } from 'components/common/TimeframeSelector'
import ChartCardWrapper from 'components/common/ChartWrapper/ChartCardWrapper'
import DynamicLineChartBody from 'components/common/DynamicLineChart/DynamicLineChartBody'

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

const timeframeOptions: TimeframeOption[] = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]
export default function PerformanceChart(props: Props) {
  const { vaultAddress } = props
  const [timeframe, setTimeframe] = useState(timeframeOptions[1].value)
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
      return <AreaChartLoading height='h-80' />
    }

    if (error || !hasData) {
      return (
        <Text size='sm' className='text-center text-white/60'>
          {error
            ? 'Failed to load chart data. Please try again later.'
            : 'No data available, come back later.'}
        </Text>
      )
    }

    return <DynamicLineChartBody data={data} lines={lines} legend={false} height='h-80' />
  }

  return (
    <ChartCardWrapper
      tabs={charts.map((chart) => ({
        title: chart.title,
        content: renderChartContent(chart.lines),
      }))}
      timeframe={timeframe}
      setTimeframe={setTimeframe}
      timeframeOptions={timeframeOptions}
    />
  )
}
