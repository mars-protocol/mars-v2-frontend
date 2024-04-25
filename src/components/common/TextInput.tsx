import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

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
}

export default function TextInput(props: Props) {
  const [value, setValue] = useState<string>(props.value ?? '')
  const inputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value !== props.value) setValue(props.value ?? '')
  }, [props.value, value])

  const onInputChange = (inputValue: string) => {
    setValue(inputValue)
    props.onChange(inputValue)
  }

  return (
    <div className={classNames('relative', props.className)}>
      {props.label && (
        <div className='absolute flex items-center h-full pl-2 border-r w-18 border-white/10 text-white/50'>
          {props.label}
        </div>
      )}
      <input
        ref={inputRef}
        type='text'
        value={value}
        onChange={(e) => onInputChange(e.target.value)}
        onBlur={props.onBlur}
        disabled={props.disabled}
        className={classNames(
          'w-full hover:cursor-pointer appearance-none p-4 py-2 outline-none bg-white/5 border rounded-sm border-white/10 ',
          'focus:border-white/20 focus:bg-white/10',
          props.label && 'pl-20',
          props.disabled && 'pointer-events-none',
        )}
        placeholder={props.placeholder ?? '0'}
      />
    </div>
  )
}
