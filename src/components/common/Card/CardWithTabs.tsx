import classNames from 'classnames'
import { useState } from 'react'

import Card from 'components/common/Card'

type Props = {
  tabs: CardTab[]
}

export function CardWithTabs(props: Props) {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <Card
      title={<Tabs onChange={setActiveIdx} activeIdx={activeIdx} {...props} />}
      className='w-full'
    >
      {props.tabs[activeIdx].renderContent()}
    </Card>
  )
}

type TabsProps = {
  tabs: CardTab[]
  onChange: (index: number) => void
  activeIdx: number
}

function Tabs(props: TabsProps) {
  return (
    <div className='flex gap-6 items-center w-full font-semibold bg-white/10 px-4'>
      {props.tabs.map((tab, index) => {
        return (
          <button
            key={tab.title}
            className={classNames(
              'py-4 border-b-[2px] border-transparent',
              props.tabs.length < 2 && 'cursor-default text-white border-transparent',
              index === props.activeIdx && props.tabs.length > 1 && 'border-mars',
              index !== props.activeIdx && props.tabs.length > 1 && 'text-white/20',
            )}
            onClick={() => props.onChange(index)}
          >
            {tab.title}
          </button>
        )
      })}
    </div>
  )
}
