import classNames from 'classnames'
import { ReactNode } from 'react'

import { Tooltip } from 'components/Tooltip'
import { useSettingsStore } from 'store/useSettingsStore'

interface Props {
  tooltip: string | ReactNode
  strokeWidth?: number
  background?: string
  diameter?: number
  value: number
  label?: string
}

export const Gauge = ({
  background = '#15161A',
  diameter = 40,
  value = 0,
  label,
  tooltip,
}: Props) => {
  const enableAnimations = useSettingsStore((s) => s.enableAnimations)

  const percentage = value * 100
  const percentageValue = percentage > 100 ? 100 : percentage < 0 ? 0 : percentage
  const semiCirclePercentage = percentageValue == -50 ? 0 : Math.abs(percentageValue / 2 - 50)

  return (
    <Tooltip content={tooltip}>
      <div
        className={classNames(
          'relative overflow-hidden',
          `w-${diameter / 4} h-${diameter / 8 + 1}`,
        )}
      >
        <svg
          viewBox='2 -2 28 36'
          width={diameter}
          height={diameter}
          style={{ transform: 'rotate(180deg)' }}
          className='absolute top-0 left-0'
        >
          <linearGradient id='gradient'>
            <stop stopColor='#C13338' offset='0%'></stop>
            <stop stopColor='#4F3D9F' offset='50%'></stop>
            <stop stopColor='#15BFA9' offset='100%'></stop>
          </linearGradient>
          <circle
            fill='none'
            stroke={background}
            strokeWidth={4}
            strokeDasharray='50 100'
            strokeLinecap='round'
            r='16'
            cx='16'
            cy='16'
            shapeRendering='geometricPrecision'
          />
          <circle
            r='16'
            cx='16'
            cy='16'
            fill='none'
            strokeLinecap='round'
            stroke='url(#gradient)'
            strokeDasharray='50 100'
            strokeWidth={5}
            style={{
              strokeDashoffset: semiCirclePercentage,
              transition: enableAnimations ? 'stroke-dashoffset 1s ease' : 'none',
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
    </Tooltip>
  )
}
