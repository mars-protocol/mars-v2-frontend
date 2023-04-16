'use client'

import classNames from 'classnames'
import { Overlay } from 'components/Overlay/Overlay'
import Option from 'components/Select/Option'
import Text from 'components/Text'
import useToggle from 'hooks/useToggle'
import { useState } from 'react'

interface Props {
  options: Option[]
  defaultValue?: string
  onChange: (value: string) => void
  isParent?: boolean
  className?: string
}

export default function Select(props: Props) {
  const [value, setValue] = useState(props.defaultValue)

  const [showDropdown, setShowDropdown] = useToggle(false)
  const selectedOption = value
    ? props.options.find((option) => option?.value || option?.denom === value)
    : null

  function handleChange(optionValue: string) {
    setValue(optionValue)
    setShowDropdown(false)
    props.onChange(optionValue)
  }

  return (
    <div
      className={classNames(props.isParent && 'relative', props.className)}
      role='select'
      onClick={() => setShowDropdown(!showDropdown)}
    >
      {selectedOption ? (
        <Option {...selectedOption} />
      ) : (
        <Text className='w-full opacity-50'>Select</Text>
      )}

      <Overlay show={showDropdown} setShow={setShowDropdown}>
        {props.options.map((option) => (
          <Option {...option} onClick={handleChange} />
        ))}
      </Overlay>
    </div>
  )
}
