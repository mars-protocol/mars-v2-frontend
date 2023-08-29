import classNames from 'classnames'
import { ReactNode } from 'react'

import { TooltipArrow } from 'components/Icons'
import Text from 'components/Text'

import { TooltipType } from '.'

interface Props {
  content: ReactNode | string
  type: TooltipType
}

export default function TooltipContent(props: Props) {
  return (
    <div>
      <div
        className={classNames(
          'flex max-w-[320px] flex-1 gap-2 rounded-sm py-0.5 px-2 text-sm shadow-tooltip backdrop-blur-lg',
          props.type === 'info' && 'bg-white/20',
          props.type === 'warning' && 'bg-warning',
          props.type === 'error' && 'bg-error',
        )}
      >
        {typeof props.content === 'string' ? (
          <Text size='sm' className='font-semibold'>
            {props.content}
          </Text>
        ) : (
          props.content
        )}
      </div>
      {
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
      }
    </div>
  )
}
