import { ChangeEvent, useCallback } from 'react'

import InputOverlay from 'components/RangeInput/InputOverlay'

type Props = {
  value: number
  onChange: (value: number) => void
  wrapperClassName?: string
  disabled?: boolean
  max: number
  marginThreshold?: number
}

function RangeSlider(props: Props) {
  const { value, max, onChange, wrapperClassName, disabled, marginThreshold } = props

  const handleOnChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(parseInt(event.target.value))
    },
    [onChange],
  )

  return (
    <div
      className={[
        className.containerDefault,
        wrapperClassName,
        disabled && className.disabled,
      ].join(' ')}
    >
      <div className={className.inputWrapper}>
        <input
          className={className.input}
          type='range'
          value={value}
          max={max}
          onChange={handleOnChange}
        />
        <InputOverlay max={max} marginThreshold={marginThreshold} value={value} />
      </div>
      <div className={className.legendWrapper}>
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

const className = {
  containerDefault: 'relative min-h-3 w-full transition-opacity',
  disabled: 'pointer-events-none opacity-50',
  legendWrapper: 'flex w-full justify-between text-xs text-opacity-50 text-white font-bold',
  inputWrapper: 'relative h-[30px]',
  input: `
    relative w-full appearance-none bg-transparent cursor-pointer
  
    [&::-webkit-slider-runnable-track]:bg-white
    [&::-webkit-slider-runnable-track]:bg-opacity-20
    [&::-webkit-slider-runnable-track]:h-[9px]
    [&::-webkit-slider-runnable-track]:rounded-lg

    [&::-moz-range-track]:bg-white
    [&::-moz-range-track]:bg-opacity-20
    [&::-moz-range-track]:h-1
    [&::-moz-range-track]:pb-[5px]
    [&::-moz-range-track]:rounded-lg
  
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:-mt-1
    [&::-webkit-slider-thumb]:w-[33px]
    [&::-webkit-slider-thumb]:h-4

    [&::-moz-range-thumb]:appearance-none
    [&::-moz-range-thumb]:opacity-0
    [&::-moz-range-thumb]:w-[33px]
    [&::-moz-range-thumb]:h-4
  `,
}

export default RangeSlider
