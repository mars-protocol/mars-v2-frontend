import Card from 'components/common/Card'
import Text from 'components/common/Text'
import classNames from 'classnames'
import { ReactNode } from 'react'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import TimeframeSelector, { TimeframeOption } from 'components/common/TimeframeSelector'

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
        <div className='flex flex-col gap-1 px-2 pb-3 min-h-80'>
          <div className='flex justify-end px-4'>
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
      className={classNames('w-full bg-black/10', className)}
      contentClassName='px-1 pb-2'
      title={
        <div className='px-4 py-3 flex items-center justify-between font-semibold bg-white/10'>
          {typeof title === 'string' ? <Text size='sm'>{title}</Text> : title}
        </div>
      }
    >
      {renderContent(children)}
    </Card>
  )
}
