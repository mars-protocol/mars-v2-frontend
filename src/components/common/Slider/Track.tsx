import classNames from 'classnames'

interface Props {
  bg: string
  maxValue: number
  sliderValue: number
}

export default function Track(props: Props) {
  const minValue = props.maxValue - 21
  let percentage = 0

  if (props.sliderValue >= props.maxValue) percentage = 100

  if (props.sliderValue > minValue && props.sliderValue < props.maxValue) {
    percentage = ((props.sliderValue - minValue) / (props.maxValue - minValue)) * 100
  }
  return (
    <div className='relative flex-1 w-1 h-1 rounded-sm bg-white/20'>
      <div
        className={classNames(
          'relative z-1',
          'h-1 rounded-sm w-1',
          'before:absolute',
          'before:top-0 before:bottom-0 before:right-0 before:left-0',
          percentage > 0 && props.bg,
          percentage > 0 && 'slider-mask',
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
