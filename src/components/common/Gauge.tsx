import classNames from 'classnames'
import { ReactElement, ReactNode } from 'react'

import { Tooltip } from 'components/common/Tooltip'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

interface Props {
  tooltip: string | ReactNode
  strokeClass?: string
  strokeWidth?: number
  background?: string
  diameter?: number
  percentage: number
  labelClassName?: string
  icon?: ReactElement
}

export const Gauge = ({
  background = 'stroke-white/13',
  strokeClass,
  strokeWidth = 4,
  diameter = 40,
  percentage = 0,
  tooltip,
  icon,
}: Props) => {
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )
  const radius = 16
  const percentageValue = percentage > 100 ? 100 : percentage < 0 ? 0 : percentage
  const circlePercent = 100 - percentageValue

  return (
    <Tooltip type='info' content={tooltip}>
      <div
        className={classNames(
          'relative grid place-items-center',
          `w-${diameter / 4} h-${diameter / 4}`,
        )}
      >
        <svg
          viewBox='2 -2 28 36'
          width={diameter}
          height={diameter}
          style={{ transform: 'rotate(-90deg)' }}
          className='absolute top-0 left-0'
        >
          {!strokeClass && (
            <linearGradient id='gradient'>
              <stop stopColor='rgba(255, 160, 187)' offset='0%'></stop>
              <stop stopColor='rgba(186, 8, 189)' offset='50%'></stop>
              <stop stopColor='rgba(255, 160, 187)' offset='100%'></stop>
            </linearGradient>
          )}
          <circle
            fill='none'
            className={background}
            strokeWidth={strokeWidth}
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
            stroke={strokeClass ? strokeClass : `url(#gradient)`}
            strokeWidth={strokeWidth}
            strokeDashoffset={circlePercent}
            strokeDasharray='100'
            pathLength='100'
            style={{
              transition: reduceMotion ? 'none' : 'stroke-dashoffset 1s ease',
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
