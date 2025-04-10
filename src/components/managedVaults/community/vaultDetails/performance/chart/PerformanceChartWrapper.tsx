import { ReactNode } from 'react'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'

interface ChartTab {
  title: string
  content: ReactNode
}

interface Props {
  charts: ChartTab[]
  className?: string
}

export default function PerformanceChartWrapper(props: Props) {
  const { charts, className } = props

  const tabs = charts.map((chart) => ({
    title: chart.title,
    renderContent: () => chart.content,
  }))

  return <CardWithTabs tabs={tabs} />
}
