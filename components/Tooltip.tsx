import Tippy from '@tippyjs/react'
import classNames from 'classnames'
import { ReactNode } from 'react'

import { SVG } from './SVG/SVG'
import Text from './Text'

interface TooltipProps {
  children?: ReactNode | string
  content: ReactNode | string
  className?: string
  delay?: number
  inderactive?: boolean
}

const Tooltip = ({
  children,
  content,
  className,
  delay = 0,
  inderactive = false,
}: TooltipProps) => {
  const iconClasses = classNames(
    'mb-2 inline-block w-[18px] cursor-pointer opacity-40 hover:opacity-80',
    className,
  )
  const tooltipClasses = classNames(
    'border border-dashed border-x-0 border-t-0 border-b-1 cursor-pointer border-white/50 transition-all hover:border-transparent ',
    className,
  )

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
        <span className={tooltipClasses}>{children}</span>
      ) : (
        <span className={iconClasses}>
          <SVG.Tooltip />
        </span>
      )}
    </Tippy>
  )
}

export default Tooltip
