import classNames from 'classnames'
import Card from 'components/common/Card'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import Text from 'components/common/Text'
import TimeframeSelector, { TimeframeOption } from 'components/common/TimeframeSelector'
import { ReactNode } from 'react'

interface Props {
  title?: string | ReactNode
  children?: ReactNode
  className?: string
  tabs?: { title: string; content: ReactNode }[]
  timeframe?: number
  setTimeframe?: (timeframe: number) => void
  timeframeOptions?: TimeframeOption[]
}

export default function ChartCardWrapper(props: Props) {
  const { title, children, className, tabs, timeframe, setTimeframe, timeframeOptions } = props

  const renderContent = (content: ReactNode) => {
    if (timeframe !== undefined && setTimeframe && timeframeOptions) {
      return (
        <div className='flex flex-col gap-0.5 px-1 pb-1 min-h-60'>
          <div className='flex justify-end px-1'>
            <TimeframeSelector
              timeframe={timeframeOptions}
              selectedTimeframe={timeframe}
              setSelectedTimeframe={setTimeframe}
              size='xs'
            />
          </div>
          {content}
        </div>
      )
    }
    return content
  }

  if (tabs) {
    return (
      <CardWithTabs
        tabs={tabs.map((tab) => ({
          title: tab.title,
          renderContent: () => renderContent(tab.content),
        }))}
      />
    )
  }

  return (
    <Card
      className={classNames('w-full', className)}
      contentClassName='px-1 py-0.5'
      title={
        <div className='px-2 py-1 flex items-center justify-between font-semibold bg-surface'>
          {typeof title === 'string' ? <Text size='xs'>{title}</Text> : title}
        </div>
      }
    >
      {renderContent(children)}
    </Card>
  )
}
