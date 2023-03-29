import classNames from 'classnames'
import { ReactElement, ReactNode } from 'react'

import { Text } from 'components/Text'

interface Props {
  title?: string | ReactElement
  children: ReactNode
  className?: string
  contentClassName?: string
}

export default function Card(props: Props) {
  return (
    <section
      className={classNames(
        props.className,
        'relative isolate max-w-full overflow-hidden rounded-base',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
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
