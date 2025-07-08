import classNames from 'classnames'

import Switch from 'components/common/Switch/index'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'

interface Props {
  name: string
  label: string
  value: boolean
  onChange: () => void
  className?: string
  tooltip?: string
  disabled?: boolean
}

export default function SwitchWithLabel(props: Props) {
  return (
    <div className={classNames('flex w-full', props.className)}>
      <div className='flex flex-1'>
        <Text className='mr-2 text-white' size='sm'>
          {props.label}
        </Text>
        {props.tooltip && (
          <Tooltip
            type='info'
            content={
              <Text size='sm' className='px-2 py-3'>
                {props.tooltip}
              </Text>
            }
            contentClassName='w-80'
          />
        )}
      </div>
      <Switch
        name={props.name}
        checked={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
      />
    </div>
  )
}
