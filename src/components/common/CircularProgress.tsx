import classNames from 'classnames'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

interface Props {
  color?: string
  size?: number
  className?: string
}

export const CircularProgress = ({ color = '#FFFFFF', size = 20, className }: Props) => {
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )
  const borderWidth = `${size / 10}px`
  const borderColor = `${color} transparent transparent transparent`
  const loaderClasses = classNames('inline-block relative', className)
  const elementClasses =
    'block absolute w-4/5 h-4/5 m-[10%] rounded-full animate-progress border-solid'

  if (reduceMotion)
    return (
      <div
        className={classNames('flex items-center', loaderClasses)}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <p
          className='w-full text-center'
          style={{ fontSize: `${size}px`, lineHeight: `${size}px`, color: `${color}` }}
        >
          ...
        </p>
      </div>
    )

  return (
    <div className={loaderClasses} style={{ width: `${size}px`, height: `${size}px` }}>
      <div
        className={elementClasses}
        style={{
          borderWidth: borderWidth,
          borderColor: borderColor,
        }}
      />
      <div
        className={elementClasses}
        style={{
          animationDelay: '-0.45s',
          borderWidth: borderWidth,
          borderColor: borderColor,
        }}
      />
      <div
        className={elementClasses}
        style={{
          animationDelay: '-0.3s',
          borderWidth: borderWidth,
          borderColor: borderColor,
        }}
      />
      <div
        className={elementClasses}
        style={{
          animationDelay: '-0.15s',
          borderWidth: borderWidth,
          borderColor: borderColor,
        }}
      />
    </div>
  )
}
