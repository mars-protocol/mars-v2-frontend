import classNames from 'classnames'

import { CheckCircled } from 'components/Icons'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/useLocalStorage'

interface Props {
  color?: string
  size?: number
  className?: string
}

export const CheckMark = ({ color = '#FFFFFF', size = 20, className }: Props) => {
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )
  const classes = classNames('inline-block relative', className)

  if (reduceMotion)
    return (
      <CheckCircled
        className={classes}
        style={{ width: `${size}px`, height: `${size}px`, color: `${color}` }}
      />
    )

  return (
    <div className={classes} style={{ width: `${size}px`, height: `${size}px` }}>
      <svg version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 130.2 130.2'>
        <circle
          className='animate-circle'
          fill='none'
          strokeDasharray='1000'
          strokeDashoffset='0'
          stroke={color}
          strokeWidth='6'
          strokeMiterlimit='10'
          cx='65.1'
          cy='65.1'
          r='62.1'
        />
        <polyline
          className='animate-check'
          fill='none'
          strokeDasharray='1000'
          strokeDashoffset='-100'
          stroke={color}
          strokeWidth='6'
          strokeLinecap='round'
          strokeMiterlimit='10'
          points='100.2,40.2 51.5,88.8 29.8,67.5 '
        />
      </svg>
    </div>
  )
}
