import classNames from 'classnames'
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Draggable from 'react-draggable'

import { OverlayMark } from 'components/Icons'
import LeverageLabel from 'components/Slider/LeverageLabel'
import Mark from 'components/Slider/Mark'
import Track from 'components/Slider/Track'
import useToggle from 'hooks/useToggle'

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
  leverage?: {
    current: number
    max: number
  }
  className?: string
  disabled?: boolean
}

export default function Slider(props: Props) {
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

  function handleDrag(e: any) {
    if (!isDragging) {
      setIsDragging(true)
    }

    const current: number = e.clientX

    if (current < sliderRect.left) {
      props.onChange(0)
      return
    }

    if (current > sliderRect.right) {
      props.onChange(100)
      return
    }

    const value = Math.round(((current - sliderRect.left) / sliderRect.width) * 100)

    if (value !== props.value) {
      props.onChange(value)
    }
  }

  function handleSliderClick(e: ChangeEvent<HTMLInputElement>) {
    props.onChange(Number(e.target.value))
  }

  function handleShowTooltip() {
    setShowTooltip(true)
  }

  function handleHideTooltip() {
    setShowTooltip(false)
  }

  function getActiveIndex() {
    if (props.value >= 100) return '5'
    if (props.value >= 75) return '4'
    if (props.value >= 50) return '3'
    if (props.value >= 25) return '2'
    return '1'
  }

  const DraggableElement: any = Draggable

  const [positionOffset, position] = useMemo(() => {
    return [
      { x: (props.value / 100) * -12, y: 0 },
      { x: (sliderRect.width / 100) * props.value, y: -2 },
    ]
  }, [props.value, sliderRect.width])

  useEffect(() => {
    handleSliderRect()
  }, [handleSliderRect])

  return (
    <div>
      <div
        ref={ref}
        className={classNames(
          'relative min-h-3 w-full transition-opacity',
          props.className,
          props.disabled && 'pointer-events-none',
        )}
        onMouseEnter={handleSliderRect}
      >
        <input
          type='range'
          value={props.value}
          onChange={handleSliderClick}
          onMouseDown={handleShowTooltip}
          className='absolute z-2 w-full hover:cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none'
        />
        <div className='absolute flex items-center w-full gap-1.5'>
          <Mark
            onClick={props.onChange}
            value={0}
            sliderValue={props.value}
            disabled={props.disabled}
            style={{ backgroundColor: colors['1'] }}
          />
          <Track maxValue={23} sliderValue={props.value} bg='before:gradient-slider-1' />
          <Mark
            onClick={props.onChange}
            value={25}
            sliderValue={props.value}
            disabled={props.disabled}
            style={{ backgroundColor: colors['2'] }}
          />
          <Track maxValue={48} sliderValue={props.value} bg='before:gradient-slider-2' />
          <Mark
            onClick={props.onChange}
            value={50}
            sliderValue={props.value}
            disabled={props.disabled}
            style={{ backgroundColor: colors['3'] }}
          />
          <Track maxValue={73} sliderValue={props.value} bg='before:gradient-slider-3' />
          <Mark
            onClick={props.onChange}
            value={75}
            sliderValue={props.value}
            disabled={props.disabled}
            style={{ backgroundColor: colors['4'] }}
          />
          <Track maxValue={98} sliderValue={props.value} bg='before:gradient-slider-4' />
          <Mark
            onClick={props.onChange}
            value={100}
            sliderValue={props.value}
            disabled={props.disabled}
            style={{ backgroundColor: colors['5'] }}
          />
        </div>
        {!props.disabled && (
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
                    'z-20 h-3 w-3 rotate-45 hover:cursor-pointer rounded-xs border-[2px] border-white',
                  )}
                  style={{ background: colors[getActiveIndex()] }}
                />
                {props.leverage ? (
                  <div className='pt-2.5'>
                    <LeverageLabel
                      leverage={props.leverage.current}
                      decimals={1}
                      className={props.leverage.current >= 10 ? '-translate-x-2' : '-translate-x-1'}
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
                      {props.value.toFixed(0)}%
                    </div>
                  )
                )}
              </div>
            </DraggableElement>
          </div>
        )}
      </div>
      {props.leverage && (
        <div className='flex justify-between pt-2'>
          <LeverageLabel
            leverage={1}
            decimals={0}
            className='-translate-x-0.5'
            style={{ opacity: props.value < 5 ? 0 : 1 }}
          />
          <LeverageLabel
            leverage={props.leverage.max || 1}
            decimals={0}
            className='translate-x-1.5'
            style={{ opacity: props.value > 95 ? 0 : 1 }}
          />
        </div>
      )}
    </div>
  )
}
