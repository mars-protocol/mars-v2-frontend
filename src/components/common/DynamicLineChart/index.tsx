import ChartCardWrapper from 'components/common/ChartWrapper/ChartCardWrapper'
import DynamicLineChartBody from 'components/common/DynamicLineChart/DynamicLineChartBody'
import AreaChartLoading from 'components/common/DynamicLineChart/AreaChartLoading'

interface Props {
  data: MergedChartData[]
  title: string | React.ReactNode
  loading?: boolean
  lines: LineConfig[]
  height?: string
  timeframe?: string
  legend?: boolean
}

export default function DynamicLineChart(props: Props) {
  const { data, loading, lines, height = 'h-65', title, timeframe, legend = true } = props

  return (
    <ChartCardWrapper title={title}>
      {data === null || loading ? (
        <AreaChartLoading height={height} />
      ) : (
        <DynamicLineChartBody
          data={data}
          lines={lines}
          height={height}
          timeframe={timeframe}
          legend={legend}
        />
      )}
    </ChartCardWrapper>
  )
}
