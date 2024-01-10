import classNames from 'classnames'
import React from 'react'

const infoLineClasses = 'flex flex-row justify-between flex-1 mb-1 text-xs text-white'

interface SummaryLineProps {
  children: React.ReactNode
  className?: string
  label: string
}
export default function SummaryLine(props: SummaryLineProps) {
  return (
    <div className={classNames(infoLineClasses, props.className)}>
      <span className='opacity-40'>{props.label}</span>
      <span>{props.children}</span>
    </div>
  )
}
