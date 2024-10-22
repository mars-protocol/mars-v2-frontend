import classNames from 'classnames'
import Select from 'components/common/Select'
import React, { useEffect, useState } from 'react'
import AssetImage from 'components/common/assets/AssetImage'
import Button from 'components/common/Button'

interface Props {
  type: 'text' | 'dropdown' | 'button'
  value: string
  asset?: Asset
  suffix?: string | JSX.Element
  // TODO: update TS once we know value
  options?: Array<{ label: string; value: any }>
  maxLength?: number
  placeholder?: string
  label?: string
  required?: boolean
  // update TS once we know value
  onChange?: (value: any) => void
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

interface InputElementProps extends Props {
  setInputValue: React.Dispatch<React.SetStateAction<string>>
}

export default function VaultInputElement(props: Props) {
  const {
    type,
    suffix,
    options,
    maxLength,
    value,
    asset,
    onChange = () => {},
    onClick,
    placeholder,
    label,
    required,
  } = props

  const [inputValue, setInputValue] = useState(value)

  const handleChange = (newValue: string) => {
    setInputValue(newValue)
    onChange(newValue)
  }

  useEffect(() => {
    setInputValue(value)
  }, [value])

  return (
    <div className='mt-2'>
      {label && (
        <label className='text-xs flex items-center'>
          {label}
          {required && <span className='text-error ml-1'>*</span>}
        </label>
      )}

      <InputElement
        type={type}
        suffix={suffix}
        options={options}
        maxLength={maxLength}
        value={inputValue}
        setInputValue={setInputValue}
        asset={asset}
        placeholder={placeholder}
        onChange={handleChange}
        onClick={onClick}
      />
    </div>
  )
}

function InputElement(props: InputElementProps) {
  const {
    type,
    suffix,
    options,
    maxLength,
    value,
    setInputValue,
    asset,
    onChange = () => {},
    onClick,
    placeholder,
  } = props

  if (type === 'button')
    return (
      <Button
        onClick={onClick}
        variant='transparent'
        color='secondary'
        className='w-full px-4 py-3 mt-3 bg-white/5 !border !border-white/10 focus:border-white/20 focus:bg-white/10 hover:cursor-pointer'
        leftIcon={asset && <AssetImage asset={asset} className='h-4 w-4' />}
        rightIcon={<span className='h-4 w-4'>{suffix}</span>}
        text={value}
        textClassNames='text-left w-full'
      />
    )

  if (type === 'dropdown')
    return (
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
        containerClassName='mt-3'
      />
    )

  if (type === 'text')
    return (
      <div className='relative mt-3'>
        <input
          type='text'
          value={value}
          onChange={onChange}
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
    )
}
