import classNames from 'classnames'
import Select from 'components/common/Select'
import Text from 'components/common/Text'
import React, { useEffect, useState } from 'react'
import { Logo } from 'components/common/Icons'

interface Props {
  type: 'text' | 'dropdown' | 'textarea' | 'button'
  value: string
  suffix?: string | JSX.Element
  // TODO: update TS once we know value
  options?: Array<{ label: string; value: any }>
  maxLength?: number
  // update TS once we know value
  onChange?: (value: any) => void
  onClick?: () => void
  placeholder?: string
  label?: string
  required?: boolean
}

export default function Input(props: Props) {
  const {
    type,
    suffix,
    options,
    maxLength,
    value,
    onChange = () => {},
    onClick,
    placeholder,
    label,
    required,
  } = props
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const newValue = event.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  return (
    <div className='mt-2'>
      {label && (
        <label className='text-xs flex items-center'>
          {label}
          {required && <span className='text-error ml-1'>*</span>}
        </label>
      )}

      {type === 'button' ? (
        <button
          type='button'
          onClick={onClick}
          className='w-full px-4 py-3 mt-2 flex justify-between items-center rounded-sm bg-white/5 border border-white/10 focus:border-white/20 focus:bg-white/10 hover:cursor-pointer'
        >
          {/* TODO: asset image */}
          <div className='flex gap-2'>
            <Logo className='h-6 w-6' />
            {value}
          </div>

          {suffix && <span className='h-4 w-4'>{suffix}</span>}
        </button>
      ) : type === 'dropdown' ? (
        <Select
          options={(options || []).map((option) => ({
            label: option.label,
            value: option.value,
          }))}
          onChange={(newValue) => {
            setInputValue(newValue)
            onChange(newValue)
          }}
          defaultValue={value}
          className='relative w-full rounded-sm bg-white/5 border border-white/10 text-white/70'
          containerClassName='mt-2'
        />
      ) : type === 'textarea' ? (
        <>
          <textarea
            value={inputValue}
            onChange={handleChange}
            maxLength={maxLength}
            placeholder={placeholder}
            className={classNames(
              'w-full mt-2 p-4 h-28 outline-none border rounded-sm bg-white/5 border-white/10 focus:border-white/20 focus:bg-white/10 hover:cursor-pointer',
            )}
          />
          <Text size='xs' className='mt-1 text-white/30 text-right'>
            <span
              className={classNames('text-xs mt-1', {
                'text-warning': maxLength
                  ? inputValue.length > 200 && inputValue.length < maxLength
                  : 'text-white/30',
                'text-error': maxLength ? inputValue.length >= maxLength : 'text-white/30',
              })}
            >
              {inputValue.length}
            </span>
            /{maxLength}
          </Text>
        </>
      ) : (
        <div className='relative mt-2'>
          <input
            type='text'
            value={inputValue}
            onChange={handleChange}
            maxLength={maxLength}
            placeholder={placeholder}
            className={classNames(
              'w-full px-4 py-3 outline-none border rounded-sm bg-white/5 border-white/10 focus:border-white/20 focus:bg-white/10 hover:cursor-pointer',
              suffix && 'pr-6',
            )}
          />
          {suffix && (
            <span className='absolute top-1/2 right-4 flex items-center text-white/70 translate-y-[-50%]'>
              {suffix}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
