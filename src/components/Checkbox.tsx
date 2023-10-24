import classNames from 'classnames'

import { Check } from 'components/Icons'
import Text from 'components/Text'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  text?: string
}

export default function Checkbox(props: Props) {
  return (
    <label className='flex gap-2 items-center cursor-pointer'>
      <input
        onChange={() => props.onChange(props.checked)}
        checked={props.checked}
        type='checkbox'
        className='opacity-0 absolute'
      />
      <div
        className={classNames(
          'h-5 w-5 rounded-sm p-0.5',
          props.checked && 'relative isolate overflow-hidden rounded-sm',
          props.checked &&
            'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
          props.checked ? 'bg-white/20' : 'border border-white/60',
        )}
      >
        {props.checked && <Check />}
      </div>
      {props.text && (
        <Text size='xs' className='text-white/60'>
          {props.text}
        </Text>
      )}
    </label>
  )
}
