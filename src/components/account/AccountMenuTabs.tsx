import React, { useState } from 'react'
import classNames from 'classnames'

type NavigationTab = {
  title: string
  renderContent: () => React.ReactNode
}

type Props = {
  tabs: NavigationTab[]
  activeIndex: number
}

export default function AccountMenuTabs(props: Props) {
  const { tabs, activeIndex } = props
  const [activeIdx, setActiveIdx] = useState(activeIndex)

  if (tabs.length === 0) return null

  return (
    <div className='w-full'>
      <div className='flex items-center h-12 w-full bg-white/5 '>
        <div className='flex items-center justify-evenly w-full gap-4'>
          {tabs.map((tab, index) => (
            <button
              key={tab.title}
              onClick={() => setActiveIdx(index)}
              className={classNames(
                'w-full py-3 text-sm border-b-2 border-transparent',
                index === activeIdx
                  ? 'text-white border-b-martian-red'
                  : 'text-white/50 hover:text-white/70',
                'transition-colors duration-200',
              )}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>
      <div className='w-full'>{tabs[activeIdx].renderContent()}</div>
    </div>
  )
}
