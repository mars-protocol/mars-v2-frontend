import classNames from 'classnames'

import { Tooltip } from 'components/Tooltip'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { REDUCE_MOTION_KEY } from 'constants/localStore'
import useHealthColorAndLabel from 'hooks/useHealthColorAndLabel'
import useLocalStorage from 'hooks/useLocalStorage'

interface Props {
  health: number
  hasLabel?: boolean
  classNames?: string
}

function calculateHealth(health: number) {
  const firstBarEnd = 43
  const secondBarStart = 47
  const secondBarEnd = 93
  const thirdBarStart = 95
  const thirdBarEnd = 184

  if (health <= 10) return (firstBarEnd / 10) * health
  if (health <= 30) return ((secondBarEnd - secondBarStart) / 20) * (health - 10) + secondBarStart
  if (health <= 100) return ((thirdBarEnd - thirdBarStart) / 70) * (health - 30) + thirdBarStart
}

export default function HealthBar(props: Props) {
  const { health } = props
  const [reduceMotion] = useLocalStorage<boolean>(REDUCE_MOTION_KEY, DEFAULT_SETTINGS.reduceMotion)
  const [color, label] = useHealthColorAndLabel(health, 'fill-')
  const width = calculateHealth(health)

  return (
    <Tooltip content={label} type='info' className='flex items-center w-full'>
      <div className={classNames('flex w-[184px] h-1', props.classNames)}>
        <svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' viewBox='0 0 184 4'>
          <mask id='healthBarMask'>
            <path fill='#FFFFFF' d='M0,2c0-1.1,0.9-2,2-2h41.6v4H2C0.9,4,0,3.1,0,2z' />
            <rect x='46' fill='#FFFFFF' width='47.2' height='4' />
            <path fill='#FFFFFF' d='M95.5,0H182c1.1,0,2,0.9,2,2s-0.9,2-2,2H95.5V0z' />
          </mask>
          <rect className='fill-white/10' width='184' height='4' mask='url(#healthBarMask)' />
          <rect
            className={classNames(color, !reduceMotion && 'transition-all duration-500')}
            width={width}
            height='4'
            mask='url(#healthBarMask)'
          />
        </svg>
      </div>
    </Tooltip>
  )
}
