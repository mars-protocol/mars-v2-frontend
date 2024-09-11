import classNames from 'classnames'
import { ReactNode } from 'react'

import { TooltipArrow } from 'Icons'
import Text from 'Text'

interface Props {
  content: ReactNode | string
  type: TooltipType
  hideArrow?: boolean
  className?: string
}

export default function TooltipContent(props: Props) {
  return (
    <div>
      <div
        className={classNames(
          'flex max-w-[320px] flex-1 gap-2 rounded-base p-3 text-sm shadow-tooltip backdrop-blur-[100px]',
          'relative isolate max-w-full overflow-hidden',
          'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
          props.type === 'info' && 'bg-white/10',
          props.type === 'warning' && 'bg-warning',
          props.type === 'error' && 'bg-error',
          props.className,
        )}
      >
        {typeof props.content === 'string' ? <Text size='xs'>{props.content}</Text> : props.content}
      </div>
      {!props.hideArrow && (
        <div data-popper-arrow=''>
          <TooltipArrow
            width={8}
            className={classNames(
              props.type === 'info' && 'text-white/20',
              props.type === 'warning' && 'text-warning',
              props.type === 'error' && 'text-error',
            )}
          />
        </div>
      )}
    </div>
  )
}
