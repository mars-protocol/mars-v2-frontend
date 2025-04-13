import PerformanceChartWrapper from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChartWrapper'
import PerformanceChartLoading from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChartLoading'
import PerformanceChartBody from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChartBody'
import { useState } from 'react'
import useHistoricalVaultData from 'hooks/managedVaults/useHistoricalVaultData'

interface Props {
  vaultAddress: string
}

const tvlLine = {
  dataKey: 'tvl',
  color: '#8884d8',
  name: 'Total Value',
  isCurrency: true,
}

const apyLine = {
  dataKey: 'apy',
  color: '#82ca9d',
  name: 'APY',
  isPercentage: true,
}

const sharePriceLine = {
  dataKey: 'sharePrice',
  color: '#ffc658',
  name: 'Share Price',
}

export default function PerformanceChart(props: Props) {
  const { vaultAddress } = props
  const [timeframe, setTimeframe] = useState(30)
  const { data, isLoading } = useHistoricalVaultData(vaultAddress, timeframe)

  const height = 'h-80'
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

  return (
    <PerformanceChartWrapper
      charts={charts.map((chart) => ({
        title: chart.title,
        content: (
          <>
            {!data || isLoading ? (
              <PerformanceChartLoading height={height} />
            ) : (
              <PerformanceChartBody data={data} lines={chart.lines} height={height} />
            )}
          </>
        ),
      }))}
      timeframe={timeframe}
      setTimeframe={setTimeframe}
    />
  )
}
