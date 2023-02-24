import classNames from 'classnames'
import { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  className?: string
}

export const Card = (props: Props) => {
  return (
    <section
      className={classNames(
        props.className,
        'h-fit w-full max-w-full overflow-hidden rounded-md border-[1px] border-white/20',
      )}
    >
      <div className='bg-white/10 p-4 font-semibold'>{props.title}</div>
      <div className=''>{props.children}</div>
    </section>
  )
}
