import classNames from 'classnames'

import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import React, { ReactNode } from 'react'

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
    <div className={classNames(infoLineClasses, props.className, 'items-center')}>
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
