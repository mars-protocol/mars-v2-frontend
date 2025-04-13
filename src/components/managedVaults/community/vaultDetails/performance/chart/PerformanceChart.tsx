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
  isCurrency: true,
}

export default function PerformanceChart({ vaultAddress }: Props) {
  const [timeframe, setTimeframe] = useState(30)
  const { data, isLoading } = useHistoricalVaultData(vaultAddress, timeframe)
  const height = 'h-80'

  return (
    <PerformanceChartWrapper
      charts={[
        {
          title: 'Vault Balance',
          content: (
            <>
              {!data || isLoading ? (
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
              {!data || isLoading ? (
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
        {
          title: 'Share Price',
          content: (
            <>
              {!data || isLoading ? (
                <PerformanceChartLoading height={height} />
              ) : (
                <PerformanceChartBody
                  data={data}
                  lines={[sharePriceLine]}
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
