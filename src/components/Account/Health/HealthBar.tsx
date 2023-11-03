import classNames from 'classnames'
import classnames from 'classnames'
import { useMemo } from 'react'

import HealthIcon from 'components/Account/Health/HealthIcon'
import HealthTooltip from 'components/Account/Health/HealthTooltip'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useHealthColor from 'hooks/useHealthColor'
import useLocalStorage from 'hooks/useLocalStorage'
import { getHealthIndicatorColors } from 'utils/healthIndicator'

interface Props {
  className?: string
  hasLabel?: boolean
  health: number
  healthFactor: number
  height?: string
  iconClassName?: string
  updatedHealth?: number
  updatedHealthFactor?: number
  showIcon?: boolean
}

function calculateHealth(health: number): number {
  const firstBarEnd = 43
  const secondBarStart = 46
  const secondBarEnd = 93
  const thirdBarStart = 96
  const thirdBarEnd = 184

  if (health <= 0) return 0
  if (health <= 10) return (firstBarEnd / 10) * health
  if (health <= 30) return ((secondBarEnd - secondBarStart) / 20) * (health - 10) + secondBarStart
  return ((thirdBarEnd - thirdBarStart) / 70) * (health - 30) + thirdBarStart
}

export default function HealthBar({
  health = 0,
  updatedHealth = 0,
  healthFactor = 0,
  updatedHealthFactor = 0,
  className,
  height = '4',
  iconClassName = 'w-5',
  showIcon = false,
}: Props) {
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )
  const width = calculateHealth(health)
  const updatedWidth = calculateHealth(updatedHealth ?? 0)
  const isUpdated = updatedWidth > 0 && updatedWidth !== width
  const isIncrease = isUpdated && updatedWidth > width
  const color = useHealthColor(health, 'fill')
  const updatedColor = useHealthColor(updatedHealth ?? 0, 'fill')
  const [backgroundColor, foreGroundColor] = useMemo(
    () => getHealthIndicatorColors(color, updatedColor, 'fill', isUpdated, isIncrease),
    [color, updatedColor, isUpdated, isIncrease],
  )

  return (
    <HealthTooltip
      health={isUpdated ? updatedHealth : health}
      healthFactor={isUpdated ? updatedHealthFactor : healthFactor}
    >
      <>
        {showIcon && (
          <HealthIcon
            health={health}
            isLoading={healthFactor === 0}
            className={classnames('mr-2', iconClassName)}
            colorClass='text-white'
          />
        )}
        <div className={classNames('flex w-full', 'rounded-full overflow-hidden', className)}>
          <svg
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            x='0px'
            y='0px'
            viewBox={`0 0 184 ${height}`}
          >
            <mask id='healthBarMask'>
              <rect x='0' fill='#FFFFFF' width='35' height={height} />
              <rect x='37.8' fill='#FFFFFF' width='35' height={height} />
              <rect x='75.6' fill='#FFFFFF' width='108.4' height={height} />
            </mask>
            <mask id='backgroundHealthBarMask'>
              <rect x='62.1' fill='white' width='2.4' height={height} />
              <rect x='48' fill='white' width='2' height={height} />
              <rect x='57.3' fill='white' width='2.4' height={height} />
              <rect x='52.5' fill='white' width='2.4' height={height} />
              <rect x='66.9' fill='white' width='2.4' height={height} />
              <rect x='86.1' fill='white' width='2.4' height={height} />
              <rect x='81.3' fill='white' width='2.4' height={height} />
              <rect x='71.7' fill='white' width='2.4' height={height} />
              <rect x='90.9' fill='white' width='2.1' height={height} />
              <rect x='76.5' fill='white' width='2.4' height={height} />
              <rect x='119.2' fill='white' width='2.4' height={height} />
              <rect x='143.2' fill='white' width='2.4' height={height} />
              <rect x='138.4' fill='white' width='2.4' height={height} />
              <rect x='133.6' fill='white' width='2.4' height={height} />
              <rect x='124' fill='white' width='2.4' height={height} />
              <rect x='100' fill='white' width='2.4' height={height} />
              <rect x='104.8' fill='white' width='2.4' height={height} />
              <rect x='109.6' fill='white' width='2.4' height={height} />
              <rect x='114.4' fill='white' width='2.4' height={height} />
              <rect x='128.8' fill='white' width='2.4' height={height} />
              <rect x='172' fill='white' width='2.4' height={height} />
              <rect x='176.8' fill='white' width='2.4' height={height} />
              <rect x='95.5' fill='white' width='2.1' height={height} />
              <path fill='white' d='M182,0h-0.4v4h0.4c1.1,0,2-0.9,2-2S183.1,0,182,0z' />
              <rect x='162.4' fill='white' width='2.4' height={height} />
              <rect x='152.8' fill='white' width='2.4' height={height} />
              <rect x='157.6' fill='white' width='2.4' height={height} />
              <rect x='167.2' fill='white' width='2.4' height={height} />
              <rect x='148' fill='white' width='2.4' height={height} />
              <rect x='17.2' fill='white' width='2.4' height={height} />
              <rect x='12.4' fill='white' width='2.4' height={height} />
              <rect x='3.1' fill='white' width='2.1' height={height} />
              <rect x='7.6' fill='white' width='2.4' height={height} />
              <rect x='22' fill='white' width='2.4' height={height} />
              <rect x='41.2' fill='white' width='2.4' height={height} />
              <rect x='36.4' fill='white' width='2.4' height={height} />
              <rect x='26.8' fill='white' width='2.4' height={height} />
              <path fill='white' d='M0.7,0.5C0.3,0.9,0,1.4,0,2s0.3,1.1,0.7,1.5V0.5z' />
              <rect x='31.6' fill='white' width='2.4' height={height} />
            </mask>
            <rect
              className='fill-white/10'
              width='184'
              height={height}
              mask='url(#healthBarMask)'
            />
            <rect
              className={classNames(
                backgroundColor,
                !reduceMotion && 'transition-all duration-500',
              )}
              width={isUpdated && isIncrease ? updatedWidth : width}
              height={height}
              mask={isUpdated ? 'url(#backgroundHealthBarMask)' : 'url(#healthBarMask)'}
            />
            {isUpdated && (
              <rect
                className={classNames(
                  foreGroundColor,
                  !reduceMotion && 'transition-all duration-500',
                )}
                width={isUpdated && !isIncrease ? updatedWidth : width}
                height={height}
                mask='url(#healthBarMask)'
              />
            )}
          </svg>
        </div>
      </>
    </HealthTooltip>
  )
}
