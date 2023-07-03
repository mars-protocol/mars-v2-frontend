import classNames from 'classnames'

import { CheckCircled, CrossCircled, ExclamationMarkTriangle } from 'components/Icons'
import Text from 'components/Text'
import { useMemo } from 'react'

interface Props {
  type: 'success' | 'error' | 'warning' | 'info'
  text: string
  button: React.ReactNode
}

export default function NotificationBanner(props: Props) {
  const [glasColor, bgColor, icon] = useMemo(() => {
    if (props.type === 'success') return ['bg-success-bg/20', 'bg-success', <CheckCircled />]
    if (props.type === 'error') return ['bg-error-bg/20', 'bg-error', <CrossCircled />]
    if (props.type === 'warning')
      return ['bg-warning-bg/20', 'bg-warning', <ExclamationMarkTriangle />]

    return ['bg-info-bg/20', 'bg-info', <ExclamationMarkTriangle />]
  }, [props.type])

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
        <Text size='sm' className='flex-1 text-white'>
          {props.text}
        </Text>
        {props.button}
      </div>
    </div>
  )
}
