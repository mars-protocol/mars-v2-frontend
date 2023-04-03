import Tippy from '@tippyjs/react'
import classNames from 'classnames'
import { ReactNode } from 'react'

import { ExclamationMarkCircled, Questionmark } from 'components/Icons'
import useStore from 'store'

interface Props {
  children?: ReactNode | string
  content: ReactNode | string
  className?: string
  delay?: number
  inderactive?: boolean
  underline?: boolean
}

export const Tooltip = ({
  children,
  content,
  className,
  delay = 0,
  inderactive = false,
  underline = false,
}: Props) => {
  const enableAnimations = useStore((s) => s.enableAnimations)

  return (
    <Tippy
      appendTo={() => document.body}
      interactive={inderactive}
      animation={false}
      delay={[delay, 0]}
      render={(attrs) => {
        return (
          <div
            className='max-w-[320px] rounded-lg bg-black/80 p-4 pl-12 text-xs shadow-tooltip backdrop-blur-lg'
            {...attrs}
          >
            <ExclamationMarkCircled className='absolute left-4 top-3.5 h-5 w-5 text-white' />
            {content}
          </div>
        )
      }}
    >
      {children ? (
        <span
          className={classNames(
            underline &&
              'border-b-1 cursor-pointer border border-x-0 border-t-0 border-dashed border-white/50 hover:border-transparent',
            enableAnimations && 'transition-all',
            className,
          )}
        >
          {children}
        </span>
      ) : (
        <span
          className={classNames(
            'inline-block w-[18px] cursor-pointer opacity-40 hover:opacity-80',
            className,
          )}
        >
          <Questionmark />
        </span>
      )}
    </Tippy>
  )
}
