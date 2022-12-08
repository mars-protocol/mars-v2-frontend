import Tippy from '@tippyjs/react'
import classNames from 'classnames'
import { ReactNode } from 'react'

import TooltipIcon from 'components/Icons/tooltip.svg'

interface Props {
  children?: ReactNode | string
  content: ReactNode | string
  className?: string
  delay?: number
  inderactive?: boolean
  underline?: boolean
}

const Tooltip = ({
  children,
  content,
  className,
  delay = 0,
  inderactive = false,
  underline = false,
}: Props) => {
  return (
    <Tippy
      appendTo={() => document.body}
      interactive={inderactive}
      animation={false}
      delay={[delay, 0]}
      render={(attrs) => {
        return (
          <div
            className='max-w-[320px] rounded-lg px-4 py-2 shadow-tooltip gradient-tooltip'
            {...attrs}
          >
            {content}
          </div>
        )
      }}
    >
      {children ? (
        <span
          className={classNames(
            underline &&
              'border-b-1 cursor-pointer border border-x-0 border-t-0 border-dashed border-white/50 transition-all hover:border-transparent',
            className,
          )}
        >
          {children}
        </span>
      ) : (
        <span
          className={classNames(
            'mb-2 inline-block w-[18px] cursor-pointer opacity-40 hover:opacity-80',
            className,
          )}
        >
          <TooltipIcon />
        </span>
      )}
    </Tippy>
  )
}

export default Tooltip
