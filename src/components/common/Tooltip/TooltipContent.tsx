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
          'flex max-w-[320px] flex-1 gap-2 rounded-sm p-3 text-sm shadow-tooltip backdrop-blur-lg',
          props.type === 'info' && 'bg-white/20',
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
