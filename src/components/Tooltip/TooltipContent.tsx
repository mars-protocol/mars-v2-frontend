import classNames from 'classnames'
import { ReactNode } from 'react'

import { ExclamationMarkCircled } from 'components/Icons'
import Text from 'components/Text'

import { TooltipType } from '.'

interface Props {
  content: ReactNode | string
  type: TooltipType
}

export default function TooltipContent(props: Props) {
  return (
    <div
      className={classNames(
        'flex max-w-[320px] flex-1 gap-2 rounded-sm p-3 text-xs shadow-tooltip backdrop-blur-lg',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
        props.type === 'info' && 'bg-white/20',
        props.type === 'warning' && 'bg-warning',
        props.type === 'error' && 'bg-error',
      )}
    >
      <div>
        <ExclamationMarkCircled className='w-5 gap-3 text-white' />
      </div>
      {typeof props.content === 'string' ? <Text size='sm'>{props.content}</Text> : props.content}
    </div>
  )
}
