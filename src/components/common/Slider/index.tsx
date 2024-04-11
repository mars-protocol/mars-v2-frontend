import classNames from 'classnames'
import debounce from 'lodash.debounce'
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Draggable from 'react-draggable'

import { OverlayMark } from 'components/common/Icons'
import LeverageLabel from 'components/common/Slider/LeverageLabel'
import Mark from 'components/common/Slider/Mark'
import Track from 'components/common/Slider/Track'
import useToggle from 'hooks/common/useToggle'

const colors = {
  '1': '#897E83',
  '2': '#BD8898',
  '3': '#DB83A5',
  '4': '#B5469B',
  '5': '#920D92',
}

type Props = {
  value: number
  onChange: (value: number) => void
  onDebounce?: () => void
  leverage?: {
    current: number
    max: number
  }
  className?: string
  disabled?: boolean
}

export default function Slider(props: Props) {
  const { value, onChange, onDebounce, leverage, className, disabled } = props
  const [showTooltip, setShowTooltip] = useToggle()
  const [sliderRect, setSliderRect] = useState({ width: 0, left: 0, right: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const nodeRef = useRef(null)
  const [isDragging, setIsDragging] = useToggle()

  const handleSliderRect = useCallback(() => {
    const leftCap = ref.current?.getBoundingClientRect().left ?? 0
    const rightCap = ref.current?.getBoundingClientRect().right ?? 0
    const newSliderWidth = ref.current?.getBoundingClientRect().width ?? 0

    if (
      sliderRect.width !== newSliderWidth ||
      leftCap !== sliderRect.left ||
      rightCap !== sliderRect.right
    ) {
      setSliderRect({
        left: leftCap,
        right: rightCap,
        width: newSliderWidth,
      })
    }
  }, [sliderRect.left, sliderRect.right, sliderRect.width])

  const debounceFunction = useMemo(
    () =>
      debounce(() => {
        if (!onDebounce) return
        onDebounce()
      }, 250),
    [onDebounce],
  )

  function handleOnChange(value: number) {
    onChange(value)
    debounceFunction()
  }

  function handleDrag(e: any) {
    if (!isDragging) {
      setIsDragging(true)
    }

    const current: number = e.clientX

    if (current < sliderRect.left) {
      handleOnChange(0)
      return
    }

    if (current > sliderRect.right) {
      handleOnChange(100)
      return
    }

    const currentValue = Math.round(((current - sliderRect.left) / sliderRect.width) * 100)

    if (currentValue !== value) {
      handleOnChange(currentValue)
    }
  }

  function handleSliderClick(e: ChangeEvent<HTMLInputElement>) {
    handleOnChange(Number(e.target.value))
  }

  function handleShowTooltip() {
    setShowTooltip(true)
  }

  function handleHideTooltip() {
    setShowTooltip(false)
  }

  function getActiveIndex() {
    if (value >= 100) return '5'
    if (value >= 75) return '4'
    if (value >= 50) return '3'
    if (value >= 25) return '2'
    return '1'
  }

  const DraggableElement: any = Draggable

  const [positionOffset, position] = useMemo(() => {
    debounceFunction()
    return [
      { x: (value / 100) * -12, y: 0 },
      { x: (sliderRect.width / 100) * value, y: -2 },
    ]
  }, [value, sliderRect.width, debounceFunction])

  useEffect(() => {
    handleSliderRect()
  }, [handleSliderRect])

  return (
    <div>
      <div
        ref={ref}
        className={classNames(
          'relative min-h-3 w-full transition-opacity',
          className,
          disabled && 'pointer-events-none',
        )}
        onMouseEnter={handleSliderRect}
      >
        <input
          type='range'
          value={value}
          onChange={handleSliderClick}
          onMouseDown={handleShowTooltip}
          className='absolute z-2 w-full hover:cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none'
        />
        <div className='absolute flex items-center w-full gap-1.5'>
          <Mark
            onClick={() => handleOnChange(0)}
            value={0}
            sliderValue={value}
            disabled={disabled}
            style={{ backgroundColor: colors['1'] }}
          />
          <Track maxValue={23} sliderValue={value} bg='before:gradient-slider-1' />
          <Mark
            onClick={() => handleOnChange(25)}
            value={25}
            sliderValue={value}
            disabled={disabled}
            style={{ backgroundColor: colors['2'] }}
          />
          <Track maxValue={48} sliderValue={value} bg='before:gradient-slider-2' />
          <Mark
            onClick={() => handleOnChange(50)}
            value={50}
            sliderValue={value}
            disabled={disabled}
            style={{ backgroundColor: colors['3'] }}
          />
          <Track maxValue={73} sliderValue={value} bg='before:gradient-slider-3' />
          <Mark
            onClick={() => handleOnChange(75)}
            value={75}
            sliderValue={value}
            disabled={disabled}
            style={{ backgroundColor: colors['4'] }}
          />
          <Track maxValue={98} sliderValue={value} bg='before:gradient-slider-4' />
          <Mark
            onClick={() => handleOnChange(100)}
            value={100}
            sliderValue={value}
            disabled={disabled}
            style={{ backgroundColor: colors['5'] }}
          />
        </div>
        {!disabled && (
          <div onMouseEnter={handleShowTooltip} onMouseLeave={handleHideTooltip}>
            <DraggableElement
              nodeRef={nodeRef}
              axis='x'
              grid={[sliderRect.width / 100, 0]}
              bounds={{ left: 0, right: sliderRect.width }}
              positionOffset={positionOffset}
              onDrag={handleDrag}
              onStop={() => setIsDragging(false)}
              position={position}
            >
              <div ref={nodeRef} className='absolute z-20 leading-3'>
                <div
                  className={classNames(
                    'z-20 h-3 w-3 rotate-45 hover:cursor-pointer rounded-xs border-[2px] border-white !outline-none',
                  )}
                  style={{ background: colors[getActiveIndex()] }}
                />
                {leverage ? (
                  <div className='pt-2.5'>
                    <LeverageLabel
                      leverage={leverage.current}
                      decimals={1}
                      className={leverage.current >= 10 ? '-translate-x-2' : '-translate-x-1'}
                    />
                  </div>
                ) : (
                  (showTooltip || isDragging) && (
                    <div className='absolute -top-8 left-1/2 -translate-x-1/2 rounded-xs bg-fuchsia px-2 py-[2px] text-xs'>
                      <OverlayMark
                        className={classNames(
                          'absolute h-2 -translate-x-1/2 -bottom-2 left-1/2 -z-1 text-fuchsia',
                        )}
                      />
                      {value.toFixed(0)}%
                    </div>
                  )
                )}
              </div>
            </DraggableElement>
          </div>
        )}
      </div>
      {leverage && (
        <div className='flex justify-between pt-2'>
          <LeverageLabel
            leverage={1}
            decimals={0}
            className='-translate-x-0.5'
            style={{ opacity: value < 5 ? 0 : 1 }}
          />
          <LeverageLabel
            leverage={leverage.max || 1}
            decimals={0}
            className='translate-x-1.5'
            style={{ opacity: value > 95 ? 0 : 1 }}
          />
        </div>
      )}
    </div>
  )
}
