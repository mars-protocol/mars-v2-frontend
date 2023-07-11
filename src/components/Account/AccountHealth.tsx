import classNames from 'classnames'

import { Heart } from 'components/Icons'
import Text from 'components/Text'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { ENABLE_ANIMATIONS_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'

interface Props {
  health: number
  hasLabel?: boolean
  classNames?: string
}

export default function AccountHealth(props: Props) {
  const [reduceMotion] = useLocalStorage<boolean>(
    ENABLE_ANIMATIONS_KEY,
    DEFAULT_SETTINGS.reduceMotion,
  )
  const healthBarWidth = (props.health / 100) * 53

  return (
    <div className={classNames('flex items-center gap-1.5', props.classNames)}>
      <div className='flex h-4 w-3 flex-auto'>
        <Heart />
      </div>
      {props.hasLabel && (
        <Text size='xs' className='pr-0.5 text-white/70'>
          Health
        </Text>
      )}
      <div className='flex flex-shrink'>
        <svg width='100%' viewBox='0 0 53 4' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <rect width='53' height='4' rx='2' fill='white' fillOpacity='0.1' />
          <rect
            width={healthBarWidth}
            height='4'
            rx='2'
            fill='url(#bar)'
            style={{
              transition: reduceMotion ? 'none' : 'width 1s ease',
            }}
          />
          <defs>
            <linearGradient
              id='bar'
              x1='0%'
              y1='0%'
              x2='100%'
              y2='0%'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='#FF645F' />
              <stop offset='0.5' stopColor='#FFB1AE' />
              <stop offset='1' stopColor='#FFD5D3' />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
