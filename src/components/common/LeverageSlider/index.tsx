import classNames from 'classnames'
import debounce from 'lodash.debounce'
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'

import InputOverlay from 'components/common/LeverageSlider/InputOverlay'
import { formatValue } from 'utils/formatters'

const LEFT_MARGIN = 5

type Props = {
  min?: number
  max: number
  value: number
  disabled?: boolean
  marginThreshold?: number
  wrapperClassName?: string
  onChange: (value: number) => void
  onBlur?: () => void
  type: LeverageSliderType
}

export type LeverageSliderType = 'margin' | 'long' | 'short'
function LeverageSlider(props: Props) {
  const { value, max, onChange, wrapperClassName, disabled, marginThreshold, onBlur, type } = props
  const min = props.min ?? 0

  const [debouncedValue, setDebouncedValue] = useState(value)

  const debouncedOnChange = useMemo(
    () =>
      debounce((newValue: number) => {
        onChange(newValue)
      }, 100),
    [onChange],
  )

  useEffect(() => {
    setDebouncedValue(value)
  }, [value])

  const handleOnChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(event.target.value)
      setDebouncedValue(newValue)
      debouncedOnChange(newValue)
    },
    [debouncedOnChange],
  )

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel()
    }
  }, [debouncedOnChange])

  const markPosPercent = 100 / (max / (marginThreshold ?? 1))
  return (
    <div
      className={classNames(
        'relative min-h-3 w-full transition-opacity pb-5',
        wrapperClassName,
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <div className='relative h-[30px]'>
        <input
          className={classNames(
            'relative w-full appearance-none bg-transparent hover:cursor-pointer',
            '[&::-webkit-slider-runnable-track]:bg-white [&::-webkit-slider-runnable-track]:bg-opacity-20 [&::-webkit-slider-runnable-track]:h-[9px] [&::-webkit-slider-runnable-track]:rounded-lg',
            '[&::-moz-range-track]:bg-white [&::-moz-range-track]:bg-opacity-20 [&::-moz-range-track]:h-1 [&::-moz-range-track]:pb-[5px] [&::-moz-range-track]:rounded-lg',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:w-[33px] [&::-webkit-slider-thumb]:h-4',
            '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:opacity-0 [&::-moz-range-thumb]:w-[33px] [&::-moz-range-thumb]:h-4',
          )}
          type='range'
          value={debouncedValue.toFixed(2)}
          step={(max - min) / 101}
          min={min}
          max={max}
          onChange={handleOnChange}
          onBlur={onBlur}
        />
        <InputOverlay
          max={max}
          marginThreshold={marginThreshold}
          value={debouncedValue}
          type={type}
          min={min}
        />
      </div>
      <div className={'flex w-full justify-between text-xs text-opacity-50 text-white font-bold'}>
        <span>{markPosPercent > LEFT_MARGIN ? min : ''}</span>
        <span>{formatValue(max, { abbreviated: false, maxDecimals: 2 })}</span>
      </div>
    </div>
  )
}

export default LeverageSlider
