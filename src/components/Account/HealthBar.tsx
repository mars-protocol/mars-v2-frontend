import classNames from 'classnames'
import { useMemo } from 'react'

import { Tooltip } from 'components/Tooltip'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { REDUCE_MOTION_KEY } from 'constants/localStore'
import useHealthColorAndLabel from 'hooks/useHealthColorAndLabel'
import useLocalStorage from 'hooks/useLocalStorage'
import { getHealthIndicatorColors } from 'utils/healthIndicator'

interface Props {
  health: number
  updatedHealth?: number
  hasLabel?: boolean
  className?: string
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

export default function HealthBar(props: Props) {
  const { health, updatedHealth } = props
  const [reduceMotion] = useLocalStorage<boolean>(REDUCE_MOTION_KEY, DEFAULT_SETTINGS.reduceMotion)
  const width = calculateHealth(health)
  const updatedWidth = calculateHealth(updatedHealth ?? 0)
  const isUpdated = updatedWidth > 0 && updatedWidth !== width
  const isIncrease = isUpdated && updatedWidth > width
  const [color, label] = useHealthColorAndLabel(health, 'fill')
  const [updatedColor, updatedLabel] = useHealthColorAndLabel(updatedHealth ?? 0, 'fill')
  const [backgroundColor, foreGroundColor] = useMemo(
    () => getHealthIndicatorColors(color, updatedColor, 'fill', isUpdated, isIncrease),
    [color, updatedColor, isUpdated, isIncrease],
  )

  return (
    <Tooltip
      content={isUpdated ? updatedLabel : label}
      type='info'
      className='flex items-center w-full'
    >
      <div className={classNames('flex w-full', props.className)}>
        <svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' viewBox='0 0 184 4'>
          <mask id='healthBarMask'>
            <path fill='#FFFFFF' d='M0,2c0-1.1,0.9-2,2-2h41.6v4H2C0.9,4,0,3.1,0,2z' />
            <rect x='46' fill='#FFFFFF' width='47' height='4' />
            <path fill='#FFFFFF' d='M95.5,0H182c1.1,0,2,0.9,2,2s-0.9,2-2,2H95.5V0z' />
          </mask>
          <mask id='backgroundHealthBarMask'>
            <rect x='62.1' fill='white' width='2.4' height='4' />
            <rect x='48' fill='white' width='2' height='4' />
            <rect x='57.3' fill='white' width='2.4' height='4' />
            <rect x='52.5' fill='white' width='2.4' height='4' />
            <rect x='66.9' fill='white' width='2.4' height='4' />
            <rect x='86.1' fill='white' width='2.4' height='4' />
            <rect x='81.3' fill='white' width='2.4' height='4' />
            <rect x='71.7' fill='white' width='2.4' height='4' />
            <rect x='90.9' fill='white' width='2.1' height='4' />
            <rect x='76.5' fill='white' width='2.4' height='4' />
            <rect x='119.2' fill='white' width='2.4' height='4' />
            <rect x='143.2' fill='white' width='2.4' height='4' />
            <rect x='138.4' fill='white' width='2.4' height='4' />
            <rect x='133.6' fill='white' width='2.4' height='4' />
            <rect x='124' fill='white' width='2.4' height='4' />
            <rect x='100' fill='white' width='2.4' height='4' />
            <rect x='104.8' fill='white' width='2.4' height='4' />
            <rect x='109.6' fill='white' width='2.4' height='4' />
            <rect x='114.4' fill='white' width='2.4' height='4' />
            <rect x='128.8' fill='white' width='2.4' height='4' />
            <rect x='172' fill='white' width='2.4' height='4' />
            <rect x='176.8' fill='white' width='2.4' height='4' />
            <rect x='95.5' fill='white' width='2.1' height='4' />
            <path fill='white' d='M182,0h-0.4v4h0.4c1.1,0,2-0.9,2-2S183.1,0,182,0z' />
            <rect x='162.4' fill='white' width='2.4' height='4' />
            <rect x='152.8' fill='white' width='2.4' height='4' />
            <rect x='157.6' fill='white' width='2.4' height='4' />
            <rect x='167.2' fill='white' width='2.4' height='4' />
            <rect x='148' fill='white' width='2.4' height='4' />
            <rect x='17.2' fill='white' width='2.4' height='4' />
            <rect x='12.4' fill='white' width='2.4' height='4' />
            <rect x='3.1' fill='white' width='2.1' height='4' />
            <rect x='7.6' fill='white' width='2.4' height='4' />
            <rect x='22' fill='white' width='2.4' height='4' />
            <rect x='41.2' fill='white' width='2.4' height='4' />
            <rect x='36.4' fill='white' width='2.4' height='4' />
            <rect x='26.8' fill='white' width='2.4' height='4' />
            <path fill='white' d='M0.7,0.5C0.3,0.9,0,1.4,0,2s0.3,1.1,0.7,1.5V0.5z' />
            <rect x='31.6' fill='white' width='2.4' height='4' />
          </mask>
          <rect className='fill-white/10' width='184' height='4' mask='url(#healthBarMask)' />
          <rect
            className={classNames(backgroundColor, !reduceMotion && 'transition-all duration-500')}
            width={isUpdated && isIncrease ? updatedWidth : width}
            height='4'
            mask={isUpdated ? 'url(#backgroundHealthBarMask)' : 'url(#healthBarMask)'}
          />
          {isUpdated && (
            <rect
              className={classNames(
                foreGroundColor,
                !reduceMotion && 'transition-all duration-500',
              )}
              width={isUpdated && !isIncrease ? updatedWidth : width}
              height='4'
              mask='url(#healthBarMask)'
            />
          )}
        </svg>
      </div>
    </Tooltip>
  )
}
