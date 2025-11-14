import classNames from 'classnames'
import { useMemo } from 'react'

import HealthIcon from 'components/account/Health/HealthIcon'
import HealthTooltip from 'components/account/Health/HealthTooltip'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthColor from 'hooks/health-computer/useHealthColor'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { getHealthIndicatorColors } from 'utils/healthIndicator'

interface Props {
  className?: string
  health: number
  healthFactor: number
  height?: string
  iconClassName?: string
  updatedHealthFactor?: number
  updatedHealth?: number
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
  const chainConfig = useChainConfig()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const width = calculateHealth(health)
  const updatedWidth = calculateHealth(updatedHealth)
  const isUpdated = updatedHealthFactor !== 0 && healthFactor !== updatedHealthFactor
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
      <div className={classNames('flex w-full', showIcon && 'gap-2')}>
        {showIcon && (
          <HealthIcon
            health={health}
            isLoading={healthFactor === 0}
            className={iconClassName}
            colorClass='text-white'
          />
        )}
        <div
          className={classNames('flex w-full shrink rounded-full md:overflow-hidden', className)}
        >
          <svg
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            x='0px'
            y='0px'
            width='100%'
            viewBox={`0 0 184 ${height}`}
          >
            <mask id='healthBarMask'>
              <rect fill='#FFFFFF' x='46' width='47' height={height} />
              <rect fill='#FFFFFF' width='43.6' height={height} />
              <rect fill='#FFFFFF' x='95.5' width='88.5' height={height} />
            </mask>
            <mask id='backgroundHealthBarMask'>
              <rect fill='#FFFFFF' x='0' y='-0.45' width='6.4' height={height} />
              <rect fill='#FFFFFF' x='8.9' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='13.7' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='18.5' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='23.3' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='28.1' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='32.9' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='37.7' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='42.7' y='-0.45' width='1.4' height={height} />
              <rect fill='#FFFFFF' x='47.3' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='52.1' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='56.9' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='61.7' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='66.5' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='71.3' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='76.1' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='80.9' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='85.7' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='90.5' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='95.3' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='100.1' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='104.9' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='109.7' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='114.5' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='119.2' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='124' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='128.8' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='133.6' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='138.4' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='143.2' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='148' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='152.8' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='157.6' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='162.4' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='167.2' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='172' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='176.8' y='-0.45' width='2.4' height={height} />
              <rect fill='#FFFFFF' x='181.6' y='-0.45' width='2.4' height={height} />
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
      </div>
    </HealthTooltip>
  )
}
