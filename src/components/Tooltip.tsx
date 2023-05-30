import Tippy from '@tippyjs/react'
import classNames from 'classnames'
import { ReactNode } from 'react'

import Text from 'components/Text'
import { ExclamationMarkCircled, Questionmark } from 'components/Icons'
import useStore from 'store'

interface Props {
  content: ReactNode | string
  type: 'info' | 'warning' | 'error'
  children?: ReactNode | string
  className?: string
  delay?: number
  interactive?: boolean
  underline?: boolean
}

export const Tooltip = (props: Props) => {
  const enableAnimations = useStore((s) => s.enableAnimations)

  return (
    <Tippy
      appendTo={() => document.querySelector('dialog[open]') ?? document.body}
      interactive={props.interactive}
      animation={false}
      delay={[props.delay ?? 0, 0]}
      render={(attrs) => {
        return (
          <div
            className={classNames(
              'flex max-w-[320px] gap-2 rounded-sm p-3 text-xs shadow-tooltip backdrop-blur-lg',
              'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
              props.type === 'info' && 'bg-white/20',
              props.type === 'warning' && 'bg-warning',
              props.type === 'error' && 'bg-error',
            )}
            {...attrs}
          >
            <ExclamationMarkCircled className='w-10 gap-3 text-white' />
            {typeof props.content === 'string' ? (
              <Text size='sm'>{props.content}</Text>
            ) : (
              props.content
            )}
          </div>
        )
      }}
    >
      {props.children ? (
        <span
          className={classNames(
            props.underline &&
              'border-b-1 cursor-pointer border border-x-0 border-t-0 border-dashed border-white/50 hover:border-transparent',
            enableAnimations && 'transition-all',
            props.className,
          )}
        >
          {props.children}
        </span>
      ) : (
        <span
          className={classNames(
            'inline-block w-[18px] cursor-pointer opacity-40 hover:opacity-80',
            props.className,
          )}
        >
          <Questionmark />
        </span>
      )}
    </Tippy>
  )
}
