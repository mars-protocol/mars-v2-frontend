import classNames from 'classnames'
import Button from 'components/common/Button'

export type TimeframeOption = {
  label: string
  value: number
}

interface Props {
  timeframe: TimeframeOption[]
  selectedTimeframe: number
  setSelectedTimeframe: (timeframe: number) => void
  className?: string
  size?: 'xs' | 'sm'
}

export default function TimeframeSelector(props: Props) {
  const { timeframe, selectedTimeframe, setSelectedTimeframe, size = 'sm', className } = props

  return (
    <div className={classNames('flex gap-3 my-0 sm:my-3', className)}>
      {timeframe.map((time, index) => (
        <Button
          color='tertiary'
          onClick={() => setSelectedTimeframe(time.value)}
          hasFocus={time.value === selectedTimeframe}
          key={index}
          text={time.label}
          size={size}
          className='px-3 text-white/80'
        />
      ))}
    </div>
  )
}
