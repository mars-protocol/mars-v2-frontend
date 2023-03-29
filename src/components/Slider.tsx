import classNames from 'classnames'
import { ChangeEvent, useRef, useState } from 'react'
import Draggable from 'react-draggable'

import { OverlayMark } from 'components/Icons/index'

type Props = {
  value: number
  onChange: (value: number) => void
  className?: string
  disabled?: boolean
}

export default function Slider(props: Props) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [sliderRect, setSliderRect] = useState({ width: 0, left: 0, right: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const nodeRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

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

  return (
    <div
      ref={ref}
      className={classNames(
        'relative min-h-3 w-full transition-opacity',
        props.className,
        props.disabled && 'pointer-events-none opacity-50',
      )}
      onMouseEnter={handleSliderRect}
    >
      <input
        type='range'
        value={props.value}
        onChange={handleSliderClick}
        onMouseDown={handleShowTooltip}
        className='absolute z-2 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none'
      />
      <div className='absolute flex  w-full items-center gap-1'>
        <Mark onClick={props.onChange} value={0} sliderValue={props.value} />
        <Track maxValue={23} sliderValue={props.value} />
        <Mark onClick={props.onChange} value={25} sliderValue={props.value} />
        <Track maxValue={48} sliderValue={props.value} />
        <Mark onClick={props.onChange} value={50} sliderValue={props.value} />
        <Track maxValue={73} sliderValue={props.value} />
        <Mark onClick={props.onChange} value={75} sliderValue={props.value} />
        <Track maxValue={98} sliderValue={props.value} />
        <Mark onClick={props.onChange} value={100} sliderValue={props.value} />
      </div>
      <div onMouseEnter={handleShowTooltip} onMouseLeave={handleHideTooltip}>
        <Draggable
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
                'z-20 h-3 w-3 rotate-45 cursor-pointer rounded-xs border-[2px] border-white bg-martian-red'
              }
            />
            {(showTooltip || isDragging) && (
              <div className='absolute -top-8 left-1/2 -translate-x-1/2 rounded-xs bg-martian-red py-[2px] px-2 text-xs'>
                <OverlayMark className='absolute left-1/2 -bottom-2 -z-1 h-2 -translate-x-1/2 text-martian-red' />
                {props.value}%
              </div>
            )}
          </div>
        </Draggable>
      </div>
    </div>
  )
}

interface MarkProps {
  value: number
  sliderValue: number
  onClick: (value: number) => void
}

function Mark(props: MarkProps) {
  return (
    <button
      onClick={() => props.onClick(props.value)}
      className={`z-20 h-3 w-3 rotate-45 rounded-xs border-[1px] border-white/20 hover:border-[2px] hover:border-white ${
        props.sliderValue >= props.value ? 'bg-martian-red hover:border-white' : 'bg-grey-medium'
      }`}
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
    <div className='relative h-1 flex-grow overflow-hidden rounded-sm bg-transparent'>
      <div className='absolute z-1 h-3 bg-martian-red ' style={{ width: `${percentage}%` }} />
      <div className='absolute h-3 w-full bg-white/20' />
    </div>
  )
}
