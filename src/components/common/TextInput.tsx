import classNames from 'classnames'
import { useRef, useState } from 'react'

import Text from 'components/common/Text'

interface Props {
  className: string
  maxLength?: number
  disabled?: boolean
  placeholder?: string
  value?: string
  label?: string
  onChange: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  error?: boolean
  errorMessage?: string
}

export default function TextInput(props: Props) {
  const [value, setValue] = useState<string>(props.value ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  const onInputChange = (inputValue: string) => {
    setValue(inputValue)
    props.onChange(inputValue)
  }

  return (
    <div
      className={classNames(
        'relative',
        props.errorMessage && props.error && 'mb-4',
        props.className,
      )}
    >
      {props.label && (
        <label
          htmlFor={props.label.toLowerCase()}
          className='absolute flex items-center h-full pl-2 border-r w-18 text-white/50 border-white/10 hover:cursor-pointer'
        >
          {props.label}
        </label>
      )}
      <input
        id={props.label ? props.label.toLowerCase() : undefined}
        ref={inputRef}
        type='text'
        value={value}
        onChange={(e) => onInputChange(e.target.value)}
        onBlur={props.onBlur}
        disabled={props.disabled}
        className={classNames(
          'w-full hover:cursor-pointer appearance-none p-4 py-2 outline-none border rounded-sm',
          props.label && 'pl-20',
          props.disabled && 'pointer-events-none',
          props.error
            ? ' bg-loss/5 border-loss/10 focus:border-loss/20 focus:bg-loss/10'
            : 'bg-white/5 border-white/10 focus:border-white/20 focus:bg-white/10',
        )}
        placeholder={props.placeholder ?? '0'}
      />
      {props.error && props.errorMessage && (
        <Text size='xs' className='absolute left-0 -bottom-5 text-loss'>
          {props.errorMessage}
        </Text>
      )}
    </div>
  )
}
