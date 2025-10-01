import classNames from 'classnames'
import { useMemo } from 'react'

import { CheckCircled, CrossCircled, ExclamationMarkTriangle } from 'components/common/Icons'
import Text from 'components/common/Text'

interface Props {
  type: 'success' | 'error' | 'warning' | 'info'
  text: string
  button: React.ReactNode
}

export default function NotificationBanner(props: Props) {
  const [glasColor, bgColor, icon] = useMemo(() => {
    if (props.type === 'success')
      return [
        'bg-success-bg/20',
        'bg-success',
        <CheckCircled className='block h-4 w-4 text-white' key={props.type} />,
      ]
    if (props.type === 'error')
      return [
        'bg-error-bg/20',
        'bg-error',
        <CrossCircled className='block h-4 w-4 text-white' key={props.type} />,
      ]
    if (props.type === 'warning')
      return [
        'bg-warning-bg/20',
        'bg-warning',
        <ExclamationMarkTriangle className='block h-4 w-4 text-white' key={props.type} />,
      ]

    return [
      'bg-info-bg/20',
      'bg-info',
      <ExclamationMarkTriangle className='block h-4 w-4 text-white' key={props.type} />,
    ]
  }, [props.type])

  return (
    <div
      className={classNames(
        'relative isolate m-0 flex w-full flex-wrap rounded-sm px-4 py-3',
        glasColor,
      )}
    >
      <div className='flex w-full items-center gap-2'>
        <div className={classNames('rounded-sm p-1.5', bgColor)}>{icon}</div>
        <Text size='sm' className='flex-1 text-white'>
          {props.text}
        </Text>
        {props.button}
      </div>
    </div>
  )
}
