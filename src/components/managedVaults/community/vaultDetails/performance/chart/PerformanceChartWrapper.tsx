import { ReactNode } from 'react'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import TimeframeSelector, { TimeframeOption } from 'components/common/TimeframeSelector'

interface ChartTab {
  title: string
  content: ReactNode
}

interface Props {
  charts: ChartTab[]
  className?: string
  timeframe: string
  setTimeframe: (timeframe: string) => void
}

const timeframeOptions: TimeframeOption[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
]

export default function PerformanceChartWrapper(props: Props) {
  const { charts, className, timeframe, setTimeframe } = props

  const tabs = charts.map((chart) => ({
    title: chart.title,
    renderContent: () => (
      <div className='flex flex-col gap-4'>
        <div className='flex justify-end px-4'>
          <TimeframeSelector
            timeframe={timeframeOptions}
            selectedTimeframe={timeframe}
            setSelectedTimeframe={setTimeframe}
            size='xs'
          />
        </div>
        {chart.content}
      </div>
    ),
  }))

  return <CardWithTabs tabs={tabs} />
}
