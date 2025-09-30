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
        'relative isolate max-w-full max-h-full',
        !props.showOverflow && 'overflow-hidden',
        isTab ? '' : 'bg-surface',
      )}
    >
      {typeof props.title === 'string' ? (
        <Text
          size='base'
          className='flex items-center w-full px-4 py-3 font-semibold bg-surface-dark border-b border-white/10'
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
