import classNames from 'classnames'
import { ReactElement, ReactNode } from 'react'

import { Tooltip } from 'components/Tooltip'
import useStore from 'store'

interface Props {
  tooltip: string | ReactNode
  strokeWidth?: number
  background?: string
  diameter?: number
  value: number
  label?: string
  icon?: ReactElement
}

export const Gauge = ({
  background = '#FFFFFF22',
  diameter = 40,
  value = 0,
  tooltip,
  icon,
}: Props) => {
  const enableAnimations = useStore((s) => s.enableAnimations)
  const radius = 16
  const percentage = value * 100
  const percentageValue = percentage > 100 ? 100 : percentage < 0 ? 0 : percentage
  const circlePercent = 100 - percentageValue

  return (
    <Tooltip content={tooltip}>
      <div className={classNames('relative', `w-${diameter / 4} h-${diameter / 4}`)}>
        <svg
          viewBox='2 -2 28 36'
          width={diameter}
          height={diameter}
          style={{ transform: 'rotate(-90deg)' }}
          className='absolute top-0 left-0'
        >
          <linearGradient id='gradient'>
            <stop stopColor='rgba(255, 160, 187)' offset='0%'></stop>
            <stop stopColor='rgba(186, 8, 189)' offset='50%'></stop>
            <stop stopColor='rgba(255, 160, 187)' offset='100%'></stop>
          </linearGradient>
          <circle
            fill='none'
            stroke={background}
            strokeWidth={4}
            strokeDashoffset='0'
            r={radius}
            cx={radius}
            cy={radius}
            shapeRendering='geometricPrecision'
          />
          <circle
            r={radius}
            cx={radius}
            cy={radius}
            fill='transparent'
            stroke='url(#gradient)'
            strokeWidth={5}
            strokeDashoffset={circlePercent}
            strokeDasharray='100'
            pathLength='100'
            style={{
              transition: enableAnimations ? 'stroke-dashoffset 1s ease' : 'none',
            }}
            shapeRendering='geometricPrecision'
            strokeLinecap='round'
          />
        </svg>
        {icon && (
          <div className='absolute inset-0 flex items-center justify-center p-2.5 opacity-30'>
            {icon}
          </div>
        )}
      </div>
    </Tooltip>
  )
}
