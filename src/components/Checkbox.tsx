import classNames from 'classnames'

import { Check } from 'components/Icons'
import Text from 'components/Text'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  name: string
  text?: string
  noMouseEvents?: boolean
}

export default function Checkbox(props: Props) {
  return (
    <>
      <input
        onChange={() => props.onChange(props.checked)}
        id={`checkbox-${props.name}`}
        name={props.name}
        checked={props.checked}
        type='checkbox'
        className={classNames('peer hidden')}
      />
      <label
        className={classNames(
          'flex items-center gap-2 border-white cursor-pointer',
          props.noMouseEvents && 'pointer-events-none',
        )}
        htmlFor={`checkbox-${props.name}`}
      >
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
    </>
  )
}
