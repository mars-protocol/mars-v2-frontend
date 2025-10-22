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
  showOverflow?: boolean
}

export default function Card(props: Props) {
  const isTab = props.isTab ?? false
  return (
    <section
      id={props.id}
      onClick={props.onClick}
      className={classNames(
        props.className,
        'flex flex-col',
        'relative isolate max-w-full md:max-h-full',
        !props.showOverflow && 'overflow-hidden',
        isTab ? '' : 'bg-surface rounded-sm border border-surface-light',
      )}
    >
      {typeof props.title === 'string' ? (
        <Text
          size='base'
          className='flex items-center w-full px-4 py-3 font-semibold bg-surface-dark'
        >
          {props.title}
        </Text>
      ) : typeof props.title === 'object' ? (
        props.title
      ) : null}
      <div className={classNames('w-full', props.contentClassName)}>{props.children}</div>
    </section>
  )
}
