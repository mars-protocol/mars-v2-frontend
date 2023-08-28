import classNames from 'classnames'

import { Tooltip } from 'components/Tooltip'

import useHealthColorAndLabel from 'hooks/useHealthColorAndLabel'

interface Props {
  health: number
  hasLabel?: boolean
  classNames?: string
}

export default function HealthBar(props: Props) {
  const { health } = props
  const [color, label] = useHealthColorAndLabel(health, 'fill-')

  return (
    <Tooltip content={label} type='info'>
      <div className={classNames('flex flex-shrink gap-0.5 py-1', props.classNames)}>
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
            className={color}
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
            className={color}
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
            className={color}
          />
        </svg>
      </div>
    </Tooltip>
  )
}
