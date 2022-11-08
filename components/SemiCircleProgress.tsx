import React from 'react'

type Props = {
  stroke?: string
  strokeWidth?: number
  background?: string
  diameter?: 60
  orientation?: any
  direction?: any
  value: number
  label?: string
}

const SemiCircleProgress = ({
  stroke = '#02B732',
  strokeWidth = 6,
  background = '#D0D0CE',
  diameter = 60,
  orientation = 'up',
  direction = 'right',
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

  let rotation
  if (orientation === 'down') {
    if (direction === 'left') {
      rotation = 'rotate(180deg) rotateY(180deg)'
    } else {
      rotation = 'rotate(180deg)'
    }
  } else {
    if (direction === 'right') {
      rotation = 'rotateY(180deg)'
    }
  }

  let strokeColorClass = 'stroke-green-500'
  if (value > 2 / 3) {
    strokeColorClass = 'stroke-red-500'
  } else if (value > 1 / 3) {
    strokeColorClass = 'stroke-yellow-500'
  }

  return (
    <div className='semicircle-container' style={{ position: 'relative' }}>
      <svg
        width={diameter}
        height={diameter / 2}
        style={{ transform: rotation, overflow: 'hidden' }}
      >
        <circle
          cx={coordinateForCircle}
          cy={coordinateForCircle}
          r={radius}
          fill='none'
          stroke={background}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: circumference,
          }}
        />
        <circle
          className={strokeColorClass}
          cx={coordinateForCircle}
          cy={coordinateForCircle}
          r={radius}
          fill='none'
          // stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: semiCirclePercentage,
            transition: 'stroke-dashoffset .3s ease 0s, stroke-dasharray .3s ease 0s, stroke .3s',
          }}
        />
      </svg>
      {label && (
        <span
          className='text-xs'
          style={{
            width: '100%',
            left: '0',
            textAlign: 'center',
            bottom: orientation === 'down' ? 'auto' : '-4px',
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
