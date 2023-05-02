import classNames from 'classnames'
import { ReactElement, ReactNode } from 'react'

import Text from 'components/Text'

interface Props {
  children: ReactNode
  className?: string
  contentClassName?: string
  title?: string | ReactElement
  id?: string
}

export default function Card(props: Props) {
  return (
    <section
      id={props.id}
      className={classNames(
        props.className,
        'relative isolate max-w-full overflow-hidden rounded-base',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
      )}
    >
      {typeof props.title === 'string' ? (
        <Text size='lg' className='flex w-full items-center bg-white/10 p-4 font-semibold'>
          {props.title}
        </Text>
      ) : typeof props.title === 'object' ? (
        props.title
      ) : null}
      <div className={classNames('w-full', props.contentClassName)}>{props.children}</div>
    </section>
  )
}
