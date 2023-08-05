import { ChangeEvent, useCallback, useMemo } from 'react'
import classNames from 'classnames'

import InputOverlay from 'components/RangeInput/InputOverlay'

type Props = {
  max: number
  value: number
  disabled?: boolean
  marginThreshold?: number
  wrapperClassName?: string
  onChange: (value: number) => void
  onBlur?: () => void
}

function RangeInput(props: Props) {
  const { value, max, onChange, wrapperClassName, disabled, marginThreshold, onBlur } = props

  const handleOnChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(event.target.value))
    },
    [onChange],
  )

  const markPosPercent = 100 / (max / (marginThreshold ?? 1))

  return (
    <div
      className={classNames(className.containerDefault, wrapperClassName, {
        [className.disabled]: disabled,
      })}
    >
      <div className={className.inputWrapper}>
        <input
          className={className.input}
          type='range'
          value={value.toFixed(2)}
          step={max / 100}
          max={max}
          onChange={handleOnChange}
          onBlur={onBlur}
        />
        <InputOverlay
          max={max}
          marginThreshold={marginThreshold}
          value={parseFloat(value.toFixed(2))}
        />
      </div>
      <div className={className.legendWrapper}>
        <span>{markPosPercent > 5 ? 0 : ''}</span>
        <span>{max.toFixed(2)}</span>
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

export default RangeInput
