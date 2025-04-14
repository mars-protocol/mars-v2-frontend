import { ReactNode } from 'react'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import TimeframeSelector, { TimeframeOption } from 'components/common/TimeframeSelector'

interface ChartTab {
  title: string
  content: ReactNode
}

interface Props {
  charts: ChartTab[]
  timeframe: number
  setTimeframe: (timeframe: number) => void
}

const timeframeOptions: TimeframeOption[] = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]

export default function PerformanceChartWrapper(props: Props) {
  const { charts, timeframe, setTimeframe } = props

  const tabs = charts.map((chart) => ({
    title: chart.title,
    renderContent: () => (
      <div className='flex flex-col gap-1 px-2 pb-3 min-h-80'>
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
