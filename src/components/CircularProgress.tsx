import classNames from 'classnames'

import { Text } from 'components/Text'
import { useSettingsStore } from 'stores/useSettingsStore'

interface Props {
  color?: string
  size?: number
  className?: string
}

export const CircularProgress = ({ color = '#FFFFFF', size = 20, className }: Props) => {
  const enableAnimations = useSettingsStore((s) => s.enableAnimations)

  const borderWidth = `${size / 10}px`
  const borderColor = `${color} transparent transparent transparent`
  const loaderClasses = classNames('inline-block relative', className)
  const elementClasses =
    'block absolute w-4/5 h-4/5 m-[10%] rounded-full animate-progress border-solid'

  if (!enableAnimations)
    return (
      <div className={loaderClasses} style={{ width: `${size}px`, height: `${size}px` }}>
        <Text className='text-center' uppercase size='lg'>
          ...
        </Text>
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
