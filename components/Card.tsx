import classNames from 'classnames'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

const Card = ({ children, className }: Props) => {
  return (
    <div
      className={classNames(
        className,
        'h-fit w-full max-w-full overflow-hidden rounded-xl border-[7px] border-accent-highlight p-4 gradient-card',
      )}
    >
      {children}
    </div>
  )
}

export default Card
