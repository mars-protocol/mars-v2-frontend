import classNames from 'classnames'
import { ChangeEvent, useRef, useState } from 'react'
import Draggable from 'react-draggable'

import { OverlayMark } from 'components/Icons/index'
import useToggle from 'hooks/useToggle'

type Props = {
  value: number
  onChange: (value: number) => void
  className?: string
  disabled?: boolean
}

export default function Slider(props: Props) {
  const [showTooltip, setShowTooltip] = useToggle()
  const [sliderRect, setSliderRect] = useState({ width: 0, left: 0, right: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const nodeRef = useRef(null)
  const [isDragging, setIsDragging] = useToggle()

  function handleSliderRect() {
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
  }

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

  const DraggableElement: any = Draggable

  return (
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
      <div className='absolute flex items-center w-full gap-1'>
        <Mark
          onClick={props.onChange}
          value={0}
          sliderValue={props.value}
          disabled={props.disabled}
        />
        <Track maxValue={23} sliderValue={props.value} />
        <Mark
          onClick={props.onChange}
          value={25}
          sliderValue={props.value}
          disabled={props.disabled}
        />
        <Track maxValue={48} sliderValue={props.value} />
        <Mark
          onClick={props.onChange}
          value={50}
          sliderValue={props.value}
          disabled={props.disabled}
        />
        <Track maxValue={73} sliderValue={props.value} />
        <Mark
          onClick={props.onChange}
          value={75}
          sliderValue={props.value}
          disabled={props.disabled}
        />
        <Track maxValue={98} sliderValue={props.value} />
        <Mark
          onClick={props.onChange}
          value={100}
          sliderValue={props.value}
          disabled={props.disabled}
        />
      </div>
      <div onMouseEnter={handleShowTooltip} onMouseLeave={handleHideTooltip}>
        <DraggableElement
          nodeRef={nodeRef}
          axis='x'
          grid={[sliderRect.width / 100, 0]}
          bounds={{ left: 0, right: sliderRect.width }}
          positionOffset={{ x: (props.value / 100) * -12, y: 0 }}
          onDrag={handleDrag}
          onStop={() => setIsDragging(false)}
          position={{ x: (sliderRect.width / 100) * props.value, y: 0 }}
        >
          <div ref={nodeRef} className='absolute z-20 leading-3'>
            <div
              className={
                'z-20 h-3 w-3 rotate-45 hover:cursor-pointer rounded-xs border-[2px] border-white bg-martian-red'
              }
            />
            {(showTooltip || isDragging) && (
              <div className='absolute -top-8 left-1/2 -translate-x-1/2 rounded-xs bg-martian-red px-2 py-[2px] text-xs'>
                <OverlayMark className='absolute h-2 -translate-x-1/2 -bottom-2 left-1/2 -z-1 text-martian-red' />
                {props.value.toFixed(0)}%
              </div>
            )}
          </div>
        </DraggableElement>
      </div>
    </div>
  )
}

interface MarkProps {
  value: number
  sliderValue: number
  onClick: (value: number) => void
  disabled?: boolean
}

function Mark(props: MarkProps) {
  return (
    <button
      onClick={() => props.onClick(props.value)}
      className={`z-20 h-3 w-3 rotate-45 rounded-xs border-[1px] border-white/20 hover:border-[2px] hover:border-white ${
        props.sliderValue >= props.value ? 'bg-martian-red hover:border-white' : 'bg-grey-medium'
      }`}
      disabled={props.disabled}
    ></button>
  )
}

interface TrackProps {
  maxValue: number
  sliderValue: number
}

function Track(props: TrackProps) {
  const minValue = props.maxValue - 21
  let percentage = 0

  if (props.sliderValue >= props.maxValue) percentage = 100

  if (props.sliderValue > minValue && props.sliderValue < props.maxValue) {
    percentage = ((props.sliderValue - minValue) / (props.maxValue - minValue)) * 100
  }

  return (
    <div className='relative flex-1 h-1 overflow-hidden bg-transparent rounded-sm'>
      <div className='absolute h-3 z-1 bg-martian-red ' style={{ width: `${percentage}%` }} />
      <div className='absolute w-full h-3 bg-white/20' />
    </div>
  )
}
