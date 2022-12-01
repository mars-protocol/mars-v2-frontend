import classNames from 'classnames'

type Props = {
  strokeWidth?: number
  background?: string
  diameter?: 60
  value: number
  label?: string
}

const SemiCircleProgress = ({
  strokeWidth = 4,
  background = '#15161A',
  diameter = 60,
  value = 0,
  label,
}: Props) => {
  const coordinateForCircle = diameter / 2
  const radius = (diameter - 2 * strokeWidth) / 2
  const circumference = Math.PI * radius
  const percentage = value * 100

  let percentageValue
  if (percentage > 100) {
    percentageValue = 100
  } else if (percentage < 0) {
    percentageValue = 0
  } else {
    percentageValue = percentage
  }

  const semiCirclePercentage = percentageValue * (circumference / 100)

  return (
    <div
      className={classNames(
        'relative overflow-hidden',
        `w-[${diameter}px] h-[${diameter / 2 + strokeWidth}px]`,
      )}
    >
      <svg
        viewBox='2 -2 28 36'
        width={diameter}
        height={diameter}
        style={{ transform: 'rotate(180deg)' }}
      >
        <linearGradient id='gradient'>
          <stop stopColor='#15BFA9' offset='0%'></stop>
          <stop stopColor='#4F3D9F' offset='50%'></stop>
          <stop stopColor='#C13338' offset='100%'></stop>
        </linearGradient>
        <circle
          fill='none'
          stroke={background}
          strokeWidth={strokeWidth}
          strokeDasharray='50 100'
          strokeLinecap='round'
          cx={coordinateForCircle}
          cy={coordinateForCircle}
          r={radius}
          shapeRendering='geometricPrecision'
        />
        <circle
          cx={coordinateForCircle}
          cy={coordinateForCircle}
          r={radius}
          fill='none'
          strokeLinecap='round'
          stroke='url(#gradient)'
          strokeDasharray='50 100'
          strokeWidth={strokeWidth}
          style={{
            strokeDashoffset: semiCirclePercentage,
            transition: 'stroke-dashoffset .3s ease 0s, stroke-dasharray .3s ease 0s, stroke .3s',
          }}
          shapeRendering='geometricPrecision'
        />
      </svg>
      {label && (
        <span
          className='text-xs'
          style={{
            width: '100%',
            left: '0',
            textAlign: 'center',
            bottom: '-2px',
            position: 'absolute',
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

export default SemiCircleProgress
