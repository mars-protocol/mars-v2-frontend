import classNames from 'classnames'
import { useMemo } from 'react'

import { Tooltip } from 'components/Tooltip'

interface Props {
  health: number
  hasLabel?: boolean
  classNames?: string
}

export default function HealthBar(props: Props) {
  const { health } = props

  const [color, label] = useMemo(() => {
    if (health > 30) return ['fill-violet-500', 'Healthy']
    if (health > 10) return ['fill-yellow-300', 'Attention']
    return ['fill-martian-red', 'Liquidation risk']
  }, [health])

  return (
    // TODO: Update tooltip to new styling
    <Tooltip content={label} type='info'>
      <div className='flex flex-shrink gap-0.5 py-1'>
        <svg fill='none' xmlns='http://www.w3.org/2000/svg' width='25%' height='4'>
          <rect
            width='100%'
            height='4'
            rx='2'
            clipPath='inset(0px 1px 0px 0px)'
            className='fill-white/10'
          />
          <rect
            width={health > 10 ? '100%' : `${(health / 10) * 100}%`}
            height='4'
            rx='2'
            clipPath='inset(0px 1px 0px 0px)'
            className={classNames(color)}
          />
        </svg>
        <svg fill='none' xmlns='http://www.w3.org/2000/svg' width='25%' height='4'>
          <rect
            width='100%'
            height='4'
            className='fill-white/10'
            clipPath='inset(0px 1px 0px 1px)'
          />
          <rect
            width={health > 30 ? '100%' : health < 10 ? '0%' : `${((health - 10) / 20) * 100}%`}
            height='4'
            clipPath='inset(0px 1px 0px 1px)'
            className={classNames(color)}
          />
        </svg>
        <svg fill='none' xmlns='http://www.w3.org/2000/svg' width='50%' height='4'>
          <rect
            width='100%'
            height='4'
            rx='2'
            clipPath='inset(0px 0px 0px 1px)'
            className='fill-white/10'
          />
          <rect
            width={health > 30 ? `${((health - 30) / 70) * 100}%` : '0%'}
            height='4'
            rx='2'
            clipPath={health > 99 ? 'inset(0px 0px 0px 1px)' : 'inset(0px 1px 0px 1px)'}
            className={classNames(color)}
          />
        </svg>
      </div>
    </Tooltip>
  )
}
