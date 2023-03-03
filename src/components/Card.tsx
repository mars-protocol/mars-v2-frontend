import classNames from 'classnames'
import { ReactNode } from 'react'

import { Text } from 'components/Text'

interface Props {
  title?: string
  children: ReactNode
  className?: string
}

export const Card = (props: Props) => {
  return (
    <section
      className={classNames(
        props.className,
        'border-card max-w-full overflow-hidden rounded-base bg-white/5',
      )}
    >
      {props.title && (
        <Text size='lg' className='bg-white/10 p-4 font-semibold'>
          {props.title}
        </Text>
      )}
      <div>{props.children}</div>
    </section>
  )
}
