import classNames from 'classnames'

import { Check } from 'components/common/Icons'
import Text from 'components/common/Text'

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
        id={`checkbox-${props.name}`}
        name={props.name}
        checked={props.checked}
        type='checkbox'
        readOnly
        className={classNames('peer hidden')}
      />
      <label
        className={classNames(
          'flex items-center gap-2 border-white cursor-pointer',
          props.noMouseEvents && 'pointer-events-none',
        )}
        htmlFor={`checkbox-${props.name}`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          props.onChange(!props.checked)
        }}
      >
        <div
          className={classNames(
            'h-5 w-5 rounded-sm p-0.5',
            props.checked && 'relative isolate overflow-hidden rounded-sm',
            props.checked ? 'bg-white/10' : 'border border-white/60',
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
