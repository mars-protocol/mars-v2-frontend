import classNames from 'classnames'

import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

interface Props {
  color?: string
  size?: number
  className?: string
}

export const CircularProgress = ({ size = 20, className }: Props) => {
  const chainConfig = useChainConfig()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const borderWidth = `${size / 10}px`
  const loaderClasses = classNames('inline-block relative', className)
  const elementClasses =
    'block absolute w-4/5 h-4/5 m-[10%] rounded-full animate-progress border border-transparent border-l-white'

  if (reduceMotion)
    return (
      <div
        className={classNames('flex items-center', loaderClasses)}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <p
          className='w-full text-center text-white'
          style={{ fontSize: `${size}px`, lineHeight: `${size}px` }}
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
        }}
      />
      <div
        className={elementClasses}
        style={{
          animationDelay: '-0.45s',
          borderWidth: borderWidth,
        }}
      />
      <div
        className={elementClasses}
        style={{
          animationDelay: '-0.3s',
          borderWidth: borderWidth,
        }}
      />
      <div
        className={elementClasses}
        style={{
          animationDelay: '-0.15s',
          borderWidth: borderWidth,
        }}
      />
    </div>
  )
}
