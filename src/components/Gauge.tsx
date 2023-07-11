import classNames from 'classnames'
import { ReactElement, ReactNode } from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import { Tooltip } from 'components/Tooltip'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { REDUCE_MOTION_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'

interface Props {
  tooltip: string | ReactNode
  strokeColor?: string
  strokeWidth?: number
  background?: string
  diameter?: number
  percentage: number
  labelClassName?: string
  icon?: ReactElement
}

export const Gauge = ({
  background = '#FFFFFF22',
  strokeColor,
  strokeWidth = 4,
  diameter = 40,
  percentage = 0,
  tooltip,
  icon,
  labelClassName,
}: Props) => {
  const [reduceMotion] = useLocalStorage<boolean>(REDUCE_MOTION_KEY, DEFAULT_SETTINGS.reduceMotion)
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
          className='absolute left-0 top-0'
        >
          {!strokeColor && (
            <linearGradient id='gradient'>
              <stop stopColor='rgba(255, 160, 187)' offset='0%'></stop>
              <stop stopColor='rgba(186, 8, 189)' offset='50%'></stop>
              <stop stopColor='rgba(255, 160, 187)' offset='100%'></stop>
            </linearGradient>
          )}
          <circle
            fill='none'
            stroke={background}
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
            stroke={strokeColor ? strokeColor : `url(#gradient)`}
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
        <FormattedNumber
          className={classNames(labelClassName, 'text-2xs')}
          amount={Math.round(percentage)}
          options={{ maxDecimals: 0, minDecimals: 0 }}
          animate
        />
      </div>
    </Tooltip>
  )
}
