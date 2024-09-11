import classNames from 'classnames'

import Switch from '../../common/Switch'
import Text from '../../common/Text'

interface Props {
  onChange: (value: boolean) => void
  name: string
  value: boolean
  label: string
  description: string | React.ReactNode
  className?: string
  withStatus?: boolean
}

export default function SettingsSwitch(props: Props) {
  return (
    <div
      className={classNames(
        'mb-6 flex w-full items-start justify-between border-b border-white/5 pb-6',
        props.className,
      )}
    >
      <div className='flex flex-wrap max-w-full w-100'>
        <Text size='lg' className='w-full mb-2'>
          {props.label}
        </Text>
        {typeof props.description === 'string' ? (
          <Text size='xs' className='text-white/50'>
            {props.description}
          </Text>
        ) : (
          <>{props.description}</>
        )}
      </div>
      <div className='flex flex-wrap justify-end w-60'>
        <Switch name={props.name} checked={props.value} onChange={props.onChange} />
        {props.withStatus && (
          <Text size='sm' className='w-full mt-2 text-end'>
            {props.value ? 'ON' : 'OFF'}
          </Text>
        )}
      </div>
    </div>
  )
}
