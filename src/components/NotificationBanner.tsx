import classNames from 'classnames'

import {
  CheckCircled,
  CrossCircled,
  ExclamationMarkCircled,
  ExclamationMarkTriangle,
} from 'components/Icons'
import Text from 'components/Text'

interface Props {
  type: 'success' | 'error' | 'warning' | 'info'
  text: string
  onClick?: () => void
}

export default function NotificationBanner(props: Props) {
  let glasColor
  let bgColor
  let textColor
  let icon

  switch (props.type) {
    case 'success':
      glasColor = 'bg-success-bg/20'
      bgColor = 'bg-success'
      textColor = 'text-success'
      icon = <CheckCircled />
      break
    case 'error':
      glasColor = 'bg-error-bg/20'
      bgColor = 'bg-error'
      textColor = 'text-error'
      icon = <CrossCircled />
      break
    case 'warning':
      glasColor = 'bg-warning-bg/20'
      bgColor = 'bg-warning'
      textColor = 'text-warning'
      icon = <ExclamationMarkTriangle />
      break
    case 'info':
      glasColor = 'bg-info-bg/20'
      bgColor = 'bg-info'
      textColor = 'text-info'
      icon = <ExclamationMarkCircled />
      break
  }

  return (
    <div
      className={classNames(
        'relative isolate m-0 flex w-full flex-wrap rounded-sm px-4 py-3',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
        glasColor,
      )}
    >
      <div className='flex w-full items-center gap-2'>
        <div className={classNames('rounded-sm p-1.5', bgColor)}>
          <span className='block h-4 w-4 text-white'>{icon}</span>
        </div>
        <Text size='sm' className='text-white'>
          {props.text}
        </Text>
      </div>
    </div>
  )
}
