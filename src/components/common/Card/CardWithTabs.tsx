import classNames from 'classnames'
import { useState } from 'react'

import Card from 'components/common/Card'

type Props = {
  tabs: CardTab[]
  textSizeClass?: string
}

export function CardWithTabs(props: Props) {
  const [activeIdx, setActiveIdx] = useState(0)

  if (props.tabs.length === 0) return null

  return (
    <Card
      title={
        <Tabs
          onChange={setActiveIdx}
          activeIdx={activeIdx}
          textSizeClass={props.textSizeClass}
          {...props}
        />
      }
      className='w-full h-full'
      contentClassName='flex-1 h-full'
    >
      {props.tabs[activeIdx].renderContent()}
    </Card>
  )
}

type TabsProps = {
  tabs: CardTab[]
  onChange: (index: number) => void
  activeIdx: number
  textSizeClass?: string
}

function Tabs(props: TabsProps) {
  return (
    <div className='flex items-center w-full gap-6 px-4 font-semibold bg-surface-dark h-14'>
      {props.tabs.map((tab, index) => {
        return (
          <button
            key={tab.title}
            className={classNames(
              'pt-4 pb-1 mb-2 border-b-[2px] border-transparent flex items-center',
              props.textSizeClass || 'text-base',
              props.tabs.length < 2 && 'cursor-default text-white border-transparent',
              index === props.activeIdx && props.tabs.length > 1 && 'border-b-martian-red',
              index !== props.activeIdx && props.tabs.length > 1 && 'text-white/20',
            )}
            onClick={() => props.onChange(index)}
          >
            {tab.title}
            <NotificationCount count={tab.notificationCount} />
          </button>
        )
      })}
    </div>
  )
}

interface NotificationCountProps {
  count?: number
}

function NotificationCount(props: NotificationCountProps) {
  if (!props.count) return null

  return <div className='px-1 ml-1 text-xs text-white rounded-sm bg-martian-red'>{props.count}</div>
}
