import classNames from 'classnames'
import { ReactNode } from 'react'

import { TooltipArrow } from 'components/common/Icons'
import Text from 'components/common/Text'

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
          'flex max-w-[320px] flex-1 gap-2 rounded-sm p-3 text-sm shadow-tooltip border border-white/10',
          'relative isolate max-w-full overflow-hidden',
          props.type === 'info' && 'bg-surface-light',
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
              props.type === 'info' && 'text-white/10',
              props.type === 'warning' && 'text-warning',
              props.type === 'error' && 'text-error',
            )}
          />
        </div>
      )}
    </div>
  )
}
