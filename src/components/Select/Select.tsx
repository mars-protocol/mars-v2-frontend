import classNames from 'classnames'
import { useEffect, useState } from 'react'

import { ChevronDown } from 'components/Icons'
import Overlay from 'components/Overlay'
import Option from 'components/Select/Option'
import Text from 'components/Text'
import useToggle from 'hooks/useToggle'

interface Props {
  options: SelectOption[]
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
    : undefined

  const [selected, setSelected] = useState<SelectOption | undefined>(selectedOption)

  const [showDropdown, setShowDropdown] = useToggle()
  function handleChange(optionValue: string) {
    setValue(optionValue)
    const option = props.options.find(
      (option) => option?.value === optionValue || option?.denom === optionValue,
    )
    if (!option) return
    setSelected(option)
    setShowDropdown(false)
    props.onChange(optionValue)
  }

  useEffect(() => {
    if (props.defaultValue && value === props.defaultValue && selected) return
    setValue(props.defaultValue)
    const option = props.options.find(
      (option) => option?.value === value || option?.denom === value,
    )
    if (!option) return
    setSelected(option)
  }, [value, props.defaultValue, props.options, selected])

  return (
    <div
      data-testid='select-component'
      className={classNames(
        props.isParent && 'relative',
        'flex min-w-fit items-center gap-2 bg-white/10',
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
        <div className='relative w-full overflow-hidden rounded-sm isolate'>
          {props.title && (
            <Text size='lg' className='block p-4 font-bold bg-white/25'>
              {props.title}
            </Text>
          )}
          {props.options.map((option: SelectOption, index: number) => (
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
