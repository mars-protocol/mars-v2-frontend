import classNames from 'classnames'
import { ReactElement, ReactNode } from 'react'

import { Text } from 'components/Text'

interface Props {
  title?: string | ReactElement
  children: ReactNode
  className?: string
  contentClassName?: string
}

export const Card = (props: Props) => {
  return (
    <section
      className={classNames(
        props.className,
        'relative z-1 flex max-w-full flex-col flex-wrap items-start overflow-hidden rounded-base border border-transparent bg-white/5',
        'before:content-[" "] before:absolute before:inset-0 before:z-[-1] before:rounded-base before:p-[1px] before:border-glas',
      )}
    >
      {props.title && (
        <Text size='lg' className='flex w-full items-center bg-white/10 p-4 font-semibold'>
          {props.title}
        </Text>
      )}
      <div className={classNames('w-full', props.contentClassName)}>{props.children}</div>
    </section>
  )
}
