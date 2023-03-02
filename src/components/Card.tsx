import classNames from 'classnames'
import { ReactNode } from 'react'

import { Text } from 'components/Text'

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
        'h-fit w-full max-w-full overflow-hidden rounded-md border border-white/20',
      )}
    >
      <Text size='lg' className='bg-white/10 p-4 font-semibold'>
        {props.title}
      </Text>
      <div>{props.children}</div>
    </section>
  )
}
