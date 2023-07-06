import classNames from 'classnames'

import Switch from 'components/Switch'
import Text from 'components/Text'

interface Props {
  onChange: () => void
  name: string
  value: boolean
  label: string
  decsription: string
  className?: string
}

export default function SettingsSwitch(props: Props) {
  return (
    <div
      className={classNames(
        'mb-6 flex w-full items-start justify-between border-b border-white/5 pb-6',
        props.className,
      )}
    >
      <div className='flex w-100 flex-wrap'>
        <Text size='lg' className='mb-2 w-full'>
          {props.label}
        </Text>
        <Text size='xs' className='text-white/50'>
          {props.decsription}
        </Text>
      </div>
      <div className='flex w-60 justify-end'>
        <Switch name={props.name} checked={props.value} onChange={props.onChange} />
      </div>
    </div>
  )
}
