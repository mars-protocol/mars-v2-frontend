import classNames from 'classnames'

export interface AnimatedCircularProgressBarProps {
  max: number
  value: number
  min?: number
  gaugePrimaryColor: string
  gaugeSecondaryColor: string
  className?: string
  usedLabel?: string | null
}

export default function AnimatedCircularProgressBar(props: AnimatedCircularProgressBarProps) {
  const {
    max = 100,
    min = 0,
    value = 0,
    gaugePrimaryColor,
    gaugeSecondaryColor,
    className,
    usedLabel = 'Used',
  } = props

  const clampValue = (val: number) => {
    if (Number.isNaN(val) || !Number.isFinite(val)) return 0
    if (val < min) return min
    if (val > max) return max
    return val
  }

  const safeMax = max <= min ? min + 1 : max
  const boundedValue = clampValue(value)
  const circumference = 2 * Math.PI * 45
  const percentPx = circumference / 100
  const currentPercent = ((boundedValue - min) / (safeMax - min)) * 100
  const percentValue = Number.isFinite(currentPercent)
    ? Math.max(0, Math.min(100, currentPercent))
    : 0

  return (
    <div
      className={classNames('relative size-40 text-sm font-semibold', className)}
      style={
        {
          '--circle-size': '100px',
          '--circumference': circumference,
          '--percent-to-px': `${percentPx}px`,
          '--gap-percent': '5',
          '--offset-factor': '0',
          '--transition-length': '1s',
          '--transition-step': '200ms',
          '--delay': '0s',
          '--percent-to-deg': '3.6deg',
          transform: 'translateZ(0)',
        } as React.CSSProperties
      }
    >
      <svg fill='none' className='size-full' strokeWidth='2' viewBox='0 0 100 100'>
        {percentValue <= 90 && percentValue >= 0 && (
          <circle
            cx='50'
            cy='50'
            r='45'
            strokeWidth='10'
            strokeDashoffset='0'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='opacity-100'
            style={
              {
                stroke: gaugeSecondaryColor,
                '--stroke-percent': 90 - percentValue,
                '--offset-factor-secondary': 'calc(1 - var(--offset-factor))',
                strokeDasharray:
                  'calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)',
                transform:
                  'rotate(calc(1turn - 90deg - (var(--gap-percent) * var(--percent-to-deg) * var(--offset-factor-secondary)))) scaleY(-1)',
                transition: 'all var(--transition-length) ease var(--delay)',
                transformOrigin: 'calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)',
              } as React.CSSProperties
            }
          />
        )}
        <circle
          cx='50'
          cy='50'
          r='45'
          strokeWidth='10'
          strokeDashoffset='0'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='opacity-100'
          style={
            {
              stroke: gaugePrimaryColor,
              '--stroke-percent': percentValue,
              strokeDasharray:
                'calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)',
              transition:
                'var(--transition-length) ease var(--delay),stroke var(--transition-length) ease var(--delay)',
              transitionProperty: 'stroke-dasharray,transform',
              transform:
                'rotate(calc(-90deg + var(--gap-percent) * var(--offset-factor) * var(--percent-to-deg)))',
              transformOrigin: 'calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)',
            } as React.CSSProperties
          }
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center text-center'>
        <span className='text-sm text-white'>{percentValue.toPrecision(4)}%</span>
        {usedLabel && <span className='text-xs text-white/60'>{usedLabel}</span>}
      </div>
    </div>
  )
}
