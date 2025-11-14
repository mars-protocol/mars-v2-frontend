import classNames from 'classnames'
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Draggable from 'react-draggable'

import { OverlayMark } from 'components/common/Icons'
import LeverageLabel from 'components/common/Slider/LeverageLabel'
import Mark from 'components/common/Slider/Mark'
import Track from 'components/common/Slider/Track'
import useToggle from 'hooks/common/useToggle'

type Props = {
  value: number
  onChange: (value: number) => void
  leverage?: {
    current: number
    max: number
    min?: number
  }
  className?: string
  disabled?: boolean
}

export default function Slider(props: Props) {
  const { value, onChange, leverage, className, disabled } = props
  const [newValue, setNewValue] = useState(value)
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

  const handleOnChange = useCallback(
    (value: number) => {
      if (value === newValue) return
      setNewValue(value)
      onChange(value)
    },
    [newValue, onChange],
  )

  const handleDrag = useCallback(
    (e: any) => {
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
    },
    [
      handleOnChange,
      isDragging,
      setIsDragging,
      sliderRect.left,
      sliderRect.right,
      sliderRect.width,
      value,
    ],
  )

  const handleSliderClick = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleOnChange(Number(e.target.value))
    },
    [handleOnChange],
  )

  const handleShowTooltip = useCallback(() => {
    setShowTooltip(true)
  }, [setShowTooltip])

  const handleHideTooltip = useCallback(() => {
    setShowTooltip(false)
  }, [setShowTooltip])

  const DraggableElement: any = Draggable

  const [positionOffset, position] = useMemo(() => {
    return [
      { x: (value / 100) * -12, y: 0 },
      { x: (sliderRect.width / 100) * value, y: -2 },
    ]
  }, [value, sliderRect.width])

  useEffect(
    () => {
      handleSliderRect()
    },
    //eslint-disable-next-line
    [],
  )

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
          />
          <Track maxValue={23} sliderValue={value} />
          <Mark onClick={() => handleOnChange(25)} value={25} sliderValue={value} />
          <Track maxValue={48} sliderValue={value} />
          <Mark onClick={() => handleOnChange(50)} value={50} sliderValue={value} />
          <Track maxValue={73} sliderValue={value} />
          <Mark
            onClick={() => handleOnChange(75)}
            value={75}
            sliderValue={value}
            disabled={disabled}
          />
          <Track maxValue={98} sliderValue={value} />
          <Mark
            onClick={() => handleOnChange(100)}
            value={100}
            sliderValue={value}
            disabled={disabled}
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
                    'bg-martian-red',
                    'z-20 h-3 w-3 rotate-45 hover:cursor-pointer rounded-xs border-2 border-martian-red outline-none!',
                  )}
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
                    <div className='absolute -top-8 left-1/2 -translate-x-1/2 rounded-xs bg-surface-light border border-white/10 px-2 py-[2px] text-xs'>
                      <OverlayMark
                        className={classNames(
                          'absolute h-2 -translate-x-1/2 -bottom-2 left-1/2 -z-1 text-white/10',
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
            leverage={leverage.min || 1}
            decimals={leverage.min ? 2 : 0}
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
