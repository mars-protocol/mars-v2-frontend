import classNames from 'classnames'
import { ReactElement, ReactNode } from 'react'

import Text from 'components/common/Text'

interface Props {
  children: ReactNode
  className?: string
  contentClassName?: string
  onClick?: () => void
  title?: string | ReactElement
  id?: string
  isTab?: boolean
}

export default function Card(props: Props) {
  const isTab = props.isTab ?? false
  const hasRoundedNone = props.className?.includes('rounded-none')

  return (
    <section
      id={props.id}
      onClick={props.onClick}
      className={classNames(
        props.className,
        'flex flex-col',
        'relative isolate max-w-full overflow-hidden max-h-full',
        isTab
          ? ''
          : classNames(
              'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:p-[1px] before:border-glas',
              !hasRoundedNone && ['rounded-base', 'before:rounded-base'],
            ),
      )}
    >
      {typeof props.title === 'string' ? (
        <Text size='lg' className='flex items-center w-full p-4 font-semibold bg-white/10'>
          {props.title}
        </Text>
      ) : typeof props.title === 'object' ? (
        props.title
      ) : null}
      <div className={classNames('w-full', props.contentClassName)}>{props.children}</div>
    </section>
  )
}
