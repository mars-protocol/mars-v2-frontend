import classNames from 'classnames'

import { Tooltip } from 'components/Tooltip'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { REDUCE_MOTION_KEY } from 'constants/localStore'
import useHealthColorAndLabel from 'hooks/useHealthColorAndLabel'
import useLocalStorage from 'hooks/useLocalStorage'

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
  const [color, label] = useHealthColorAndLabel(health, 'fill-')
  const [updatedColor, updatedLabel] = useHealthColorAndLabel(updatedHealth ?? 0, 'fill-')

  let backgroundColor = color
  if (isUpdated && isIncrease) backgroundColor = updatedColor
  if (isUpdated && !isIncrease) backgroundColor = 'fill-grey'

  const foreGroundColor = isIncrease ? 'fill-grey' : updatedColor

  return (
    <Tooltip
      content={isUpdated ? updatedLabel : label}
      type='info'
      className='flex items-center w-full'
    >
      <div className={classNames('flex max-w-[184px] max-h-1', props.className)}>
        <svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' viewBox='0 0 184 4'>
          <mask id='healthBarMask'>
            <path fill='#FFFFFF' d='M0,2c0-1.1,0.9-2,2-2h41.6v4H2C0.9,4,0,3.1,0,2z' />
            <rect x='46' fill='#FFFFFF' width='47' height='4' />
            <path fill='#FFFFFF' d='M95.5,0H182c1.1,0,2,0.9,2,2s-0.9,2-2,2H95.5V0z' />
          </mask>
          <rect className='fill-white/10' width='184' height='4' mask='url(#healthBarMask)' />
          <rect
            className={classNames(backgroundColor, !reduceMotion && 'transition-all duration-500')}
            width={isUpdated && isIncrease ? updatedWidth : width}
            height='4'
            mask='url(#healthBarMask)'
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
