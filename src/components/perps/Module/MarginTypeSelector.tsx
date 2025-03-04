import { useState } from 'react'
import classNames from 'classnames'

type MarginType = 'cross' | 'isolated'

interface Props {
  selected: MarginType
  onChange: (type: MarginType) => void
}

export default function MarginTypeSelector({ selected, onChange }: Props) {
  const tabs = [
    { id: 'cross', label: 'Cross Margin' },
    { id: 'isolated', label: 'Isolated Margin' },
  ] as const

  return (
    <div className='flex w-full rounded-lg bg-white/5 p-1'>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={classNames(
            'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
            selected === tab.id ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white/80',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
