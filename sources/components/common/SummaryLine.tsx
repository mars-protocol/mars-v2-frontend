import classNames from 'classnames'

import React, { ReactNode } from 'react'
import Text from './Text'
import { Tooltip } from './Tooltip'

const infoLineClasses = 'flex flex-row justify-between flex-1 mb-1 text-xs text-white'

interface SummaryLineProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  label: string
  tooltip?: string | ReactNode
}
export default function SummaryLine(props: SummaryLineProps) {
  return (
    <div className={classNames(infoLineClasses, props.className)}>
      {props.tooltip ? (
        <Tooltip content={<span className='text-sm'>{props.tooltip}</span>} type='info' underline>
          <Text size='xs' className='text-white/50'>
            {props.label}
          </Text>
        </Tooltip>
      ) : (
        <span className='text-white/50'>{props.label}</span>
      )}
      <span className={props.contentClassName}>{props.children}</span>
    </div>
  )
}
