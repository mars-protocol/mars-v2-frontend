import Tippy from '@tippyjs/react'
import classNames from 'classnames'
import { ReactNode } from 'react'

import { Questionmark } from 'components/Icons'
import useStore from 'store'
import TooltipContent from 'components/Tooltip/TooltipContent'

interface Props {
  content: ReactNode | string
  type: TooltipType
  children?: ReactNode | string
  className?: string
  delay?: number
  interactive?: boolean
  underline?: boolean
}

export type TooltipType = 'info' | 'warning' | 'error'

export const Tooltip = (props: Props) => {
  const enableAnimations = useStore((s) => s.enableAnimations)

  return (
    <Tippy
      appendTo={() => document.querySelector('dialog[open]') ?? document.body}
      interactive={props.interactive}
      animation={false}
      delay={[props.delay ?? 0, 0]}
      render={() => <TooltipContent type={props.type} content={props.content} />}
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
