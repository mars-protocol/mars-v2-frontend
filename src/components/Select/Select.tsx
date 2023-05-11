'use client'

import classNames from 'classnames'
import { useEffect, useState } from 'react'

import { ChevronDown } from 'components/Icons'
import Overlay from 'components/Overlay'
import Option from 'components/Select/Option'
import Text from 'components/Text'
import useToggle from 'hooks/useToggle'

interface Props {
  options: Option[]
  defaultValue?: string
  onChange: (value: string) => void
  isParent?: boolean
  className?: string
  title?: string
}

export default function Select(props: Props) {
  const [value, setValue] = useState(props.defaultValue)
  const selectedOption = value
    ? props.options.find((option) => option?.value === value || option?.denom === value)
    : null

  const [selected, setSelected] = useState<Option>(selectedOption)

  const [showDropdown, setShowDropdown] = useToggle()
  function handleChange(optionValue: string) {
    setValue(optionValue)
    setSelected(
      props.options.find(
        (option) => option?.value === optionValue || option?.denom === optionValue,
      ),
    )
    setShowDropdown(false)
    props.onChange(optionValue)
  }

  useEffect(() => {
    if (props.defaultValue && value === props.defaultValue && selected) return
    setValue(props.defaultValue)
    setSelected(
      props.options.find(
        (option) => option?.value === props.defaultValue || option?.denom === props.defaultValue,
      ),
    )
  }, [value, props.defaultValue, props.options, selected])

  return (
    <div
      className={classNames(
        props.isParent && 'relative',
        'flex min-w-fit items-center gap-2',
        props.className,
      )}
      role='select'
      onClick={() => setShowDropdown(!showDropdown)}
    >
      {selected ? (
        <Option {...selected} isClicked={showDropdown} isDisplay />
      ) : (
        <div
          className={classNames('flex items-center gap-2 bg-white/10 p-3', 'hover:cursor-pointer')}
        >
          <Text className='w-full opacity-50 hover:cursor-pointer'>Select</Text>
          <span
            className={classNames(
              'inline-block w-2.5 transition-transform',
              showDropdown ? 'rotate-0' : '-rotate-90',
            )}
          >
            <ChevronDown />
          </span>
        </div>
      )}
      <Overlay
        show={showDropdown}
        className={classNames('left-0 top-[calc(100%+8px)] isolate w-full')}
        setShow={setShowDropdown}
        hasBackdropIsolation
      >
        <div className='relative isolate w-full overflow-hidden rounded-sm'>
          {props.title && (
            <Text size='lg' className='block bg-white/25 p-4 font-bold'>
              {props.title}
            </Text>
          )}
          {props.options.map((option: Option, index: number) => (
            <Option
              key={index}
              {...option}
              isSelected={
                option?.value
                  ? option?.value === selected?.value
                  : option?.denom === selected?.denom
              }
              onClick={handleChange}
            />
          ))}
        </div>
      </Overlay>
    </div>
  )
}
