import classNames from 'classnames'
import { useMemo } from 'react'

import { Tooltip } from 'components/Tooltip'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { REDUCE_MOTION_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import { Heart } from 'components/Icons'
import useHealthColorAndLabel from 'hooks/useHealthColorAndLabel'

interface Props {
  diameter?: number
  health: number
}

const RADIUS = 350
const ROTATION = {
  rotate: '-125deg',
  transformOrigin: 'center',
}

export const HealthGauge = ({ diameter = 40, health = 0 }: Props) => {
  const [color, label] = useHealthColorAndLabel(health, 'text-')
  const [reduceMotion] = useLocalStorage<boolean>(REDUCE_MOTION_KEY, DEFAULT_SETTINGS.reduceMotion)
  const percentage = useMemo(
    () =>
      100 -
      (health > 30
        ? ((health - 30) / 70) * 50 + 50
        : health > 10
        ? ((health - 10) / 30) * 25 + 25
        : (health / 10) * 25),
    [health],
  )

  return (
    <Tooltip type='info' content={label}>
      <div
        className={classNames(
          'relative grid place-items-center',
          `w-${diameter / 4} h-${diameter / 4}`,
        )}
      >
        <Heart className={color} width={20} />
        <svg
          version='1.1'
          xmlns='http://www.w3.org/2000/svg'
          x='0px'
          y='0px'
          viewBox='0 0 700 700'
          className='absolute'
        >
          <mask id='mask'>
            <g transform='matrix(-0.5,0.866025,-0.866025,-0.5,827.404,221.632)'>
              <path
                fill='white'
                d='M585.2,594.5C577.4,594.5 569.5,591.7 563.3,586.1C549.9,574 548.8,553.3 560.9,539.8C601.3,494.9 626,439.5 632.3,379.4C638.6,319.3 626,259.9 595.8,207.7C586.8,192 592.1,172 607.8,162.9C623.5,153.8 643.5,159.2 652.6,174.9C689.8,239.2 705.3,312.3 697.5,386.3C689.7,460.2 659.3,528.5 609.6,583.7C603,590.9 594.1,594.5 585.2,594.5Z'
              />
            </g>
            <g transform='matrix(-0.5,0.866025,-0.866025,-0.5,827.404,221.632)'>
              <path
                fill='white'
                d='M561.7,147C553.9,147 546,144.2 539.8,138.6C494.9,98.2 439.5,73.5 379.4,67.2C319.4,60.9 259.9,73.5 207.6,103.7C191.9,112.8 171.9,107.4 162.8,91.7C153.7,76 159.1,56 174.8,46.9C239.2,9.7 312.3,-5.8 386.2,2C460.1,9.8 528.4,40.2 583.6,89.9C597,102 598.1,122.7 586,136.2C579.6,143.3 570.7,147 561.7,147Z'
              />
            </g>
            <g transform='matrix(-0.5,0.866025,-0.866025,-0.5,827.404,221.632)'>
              <path
                fill='white'
                d='M349.6,699.3C328.4,699.3 307.1,697.4 285.9,693.5C204.1,678.3 130.2,634.4 77.9,569.8C25.6,505.2 -2.1,423.8 0.1,340.6C2.3,257.4 34.1,177.6 89.8,115.8C101.9,102.4 122.7,101.3 136.1,113.4C149.5,125.5 150.6,146.2 138.5,159.7C93.3,209.9 67.4,274.8 65.6,342.4C63.8,410 86.3,476.1 128.8,528.6C171.3,581.1 231.4,616.8 297.8,629.2C364.2,641.5 433.1,629.7 491.6,595.9C507.3,586.8 527.3,592.2 536.4,607.9C545.4,623.6 540.1,643.6 524.4,652.7C471,683.4 410.6,699.3 349.6,699.3Z'
              />
            </g>
          </mask>
          <circle
            r={RADIUS}
            cx={RADIUS}
            cy={RADIUS}
            fill='white'
            fillOpacity={0.2}
            mask='url(#mask)'
            style={ROTATION}
          />
          <circle
            r={316}
            cx={RADIUS}
            cy={RADIUS}
            fill='transparent'
            strokeWidth={64}
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={percentage}
            style={ROTATION}
            mask='url(#mask)'
            className={classNames(
              color,
              'stroke-current',
              !reduceMotion && 'transition-color transition-[stroke-dashoffset] duration-500',
            )}
          />
        </svg>
      </div>
    </Tooltip>
  )
}
