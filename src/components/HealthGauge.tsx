import classNames from 'classnames'
import { useMemo } from 'react'

import { Heart } from 'components/Icons'
import { Tooltip } from 'components/Tooltip'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useHealthColorAndLabel from 'hooks/useHealthColorAndLabel'
import useLocalStorage from 'hooks/useLocalStorage'
import { computeHealthGaugePercentage } from 'utils/accounts'
import { getHealthIndicatorColors } from 'utils/healthIndicator'

interface Props {
  diameter?: number
  health: number
  updatedHealth?: number
}

const RADIUS = 350
const ROTATION = {
  rotate: '-126deg',
  transformOrigin: 'center',
}

export const HealthGauge = ({ diameter = 40, health = 0, updatedHealth = 0 }: Props) => {
  const [color, label] = useHealthColorAndLabel(health, 'text')
  const [updatedColor, updatedLabel] = useHealthColorAndLabel(updatedHealth ?? 0, 'text')
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )
  const percentage = useMemo(() => computeHealthGaugePercentage(health), [health])
  const updatedPercentage = useMemo(
    () => computeHealthGaugePercentage(updatedHealth),
    [updatedHealth],
  )
  const isUpdated = updatedHealth !== 0 && updatedPercentage !== percentage
  const isIncrease = isUpdated && updatedPercentage < percentage
  const [backgroundColor, foreGroundColor] = useMemo(
    () => getHealthIndicatorColors(color, updatedColor, 'text', isUpdated, isIncrease),
    [color, updatedColor, isUpdated, isIncrease],
  )

  const tooltipContent = health === 0 ? 'loading...' : isUpdated ? updatedLabel : label

  return (
    <Tooltip type='info' content={tooltipContent}>
      <div
        className={classNames(
          'relative grid place-items-center',
          `w-${diameter / 4} h-${diameter / 4}`,
        )}
      >
        <Heart className='text-white/50' width={20} />
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
          <mask id='backgroundMask'>
            <g>
              <path
                fill='white'
                d='M137.1,538.3c-5.8-6.5-11.3-13.3-16.5-20.4l-57.8,31.9c7.4,10.5,15.3,20.7,23.8,30.3L137.1,538.3z'
              />
              <path
                fill='white'
                d='M179.4,577.1c-8.1-6-15.8-12.4-23.1-19.2L105.5,600c10.3,10,21.3,19.5,32.9,28.3L179.4,577.1z'
              />
              <path
                fill='white'
                d='M79.5,437.5c-5.6-17.2-24.1-26.6-41.3-21.1c-7.9,2.6-14.3,8-18.2,14.8c-4.5,7.7-5.8,17.2-2.8,26.5c0.3,1,0.6,1.9,1,2.9
		l62.7-19.4C80.3,440,79.9,438.7,79.5,437.5z'
              />
              <path
                fill='white'
                d='M105.6,495.1c-5.4-9.2-10.4-18.7-14.8-28.5l-63,19.5c5.9,14.1,12.8,27.7,20.4,40.7L105.6,495.1z'
              />
              <path
                fill='white'
                d='M223.5,604.3c-7.3-3.6-14.5-7.6-21.5-11.9L160.8,644c10.4,6.7,21.1,12.8,32,18.3L223.5,604.3z'
              />
              <path
                fill='white'
                d='M275.6,624c-9.2-2.5-18.2-5.4-27.1-8.8l-30.8,58.4c13,5.3,26.2,9.8,39.8,13.5L275.6,624z'
              />
              <path
                fill='white'
                d='M352.5,633.9l-6.1,65.4c1.1,0,2.1,0,3.2,0c18.1,0,32.8-14.7,32.8-32.8C382.4,649.4,369.3,635.4,352.5,633.9z'
              />
              <path
                fill='white'
                d='M325.3,632.7c-7.7-0.6-15.4-1.6-22.9-2.9l-18.3,63.4c11.6,2.2,23.3,3.8,35.1,4.8L325.3,632.7z'
              />
              <path
                fill='white'
                d='M519.5,577.5c-5.8,4.3-11.8,8.4-17.9,12.3l31.7,57.4c9.7-6,19.1-12.4,28.1-19.3L519.5,577.5z'
              />
              <path
                fill='white'
                d='M559.1,541.7c-5.9,6.5-12.1,12.6-18.5,18.4l41.9,50.5c9.8-8.8,19.1-18.1,27.9-28L559.1,541.7z'
              />
              <path
                fill='white'
                d='M477.9,603.2c-7.8,3.9-15.9,7.5-24.1,10.8l19.4,62.7c12.5-4.7,24.7-10.1,36.4-16.1L477.9,603.2z'
              />
              <path
                fill='white'
                d='M589,502.6c-3,4.7-6.2,9.4-9.5,14c-1,1.4-2,2.7-3,4.1l51.2,40.9c1.6-2.1,3.3-4.3,4.9-6.5c5.2-7.1,10-14.4,14.6-21.7
		L589,502.6z'
              />
              <path
                fill='white'
                d='M666.6,316.8c-18.1,0-32.8,14.7-32.8,32.8c0,10.1-0.5,20-1.6,29.9l65.3,6.1c1.2-11.9,1.8-23.9,1.8-36
		C699.4,331.4,684.7,316.7,666.6,316.8z'
              />
              <path
                fill='white'
                d='M428.4,624.4c-3.8,2.7-6.9,6.2-9.2,10.2c-4.5,7.8-5.7,17.4-2.8,26.4c4.4,13.6,16.8,22.3,30.3,22.6L428.4,624.4z'
              />
              <path
                fill='white'
                d='M613.8,454.5c-3.3,8.3-7,16.5-11.1,24.5l58,30.6c6.2-12,11.7-24.3,16.4-36.9L613.8,454.5z'
              />
              <path
                fill='white'
                d='M628.1,406.5c-1.5,7.5-3.3,14.9-5.5,22.2l63.1,18.2c3.3-11.3,5.9-22.7,8-34.3L628.1,406.5z'
              />
              <path
                fill='white'
                d='M458.8,87.2c10.3,4.3,20.3,9.2,30.1,14.7l30.6-58c-13.7-7.6-27.9-14.3-42.4-20L458.8,87.2z'
              />
              <path
                fill='white'
                d='M512,116.4c7.5,5.3,14.8,10.9,21.8,16.8l40.9-51.2c-10.1-8.5-20.8-16.5-31.9-23.9L512,116.4z'
              />
              <path
                fill='white'
                d='M343.4,65.5c11.6-0.3,23.1,0.2,34.6,1.4L384,1.6c-15.9-1.6-31.9-2.1-48-1.4L343.4,65.5z'
              />
              <path
                fill='white'
                d='M574.3,175.6l50.5-41.9c-9.2-11.8-19.2-22.9-29.9-33.4l-41.2,51.6C561,159.4,567.9,167.3,574.3,175.6z'
              />
              <path
                fill='white'
                d='M32.7,382.2c16.6,0,30.2-12.2,32.5-28.1L0,348c0,0.5,0,0.9,0,1.4C0,367.6,14.7,382.2,32.7,382.2z'
              />
              <path
                fill='white'
                d='M590,198c4.6,7.3,8.8,14.7,12.8,22.4l57.4-31.7c-5.9-11.3-12.3-22.3-19.4-32.9L590,198z'
              />
              <path
                fill='white'
                d='M619.8,261.7c5.6,17.2,24.1,26.6,41.3,21.1c17.2-5.6,26.6-24.1,21.1-41.3c-3.1-9.5-6.6-18.9-10.5-28L614,245.4
		C616.1,250.8,618.1,256.2,619.8,261.7z'
              />
              <path
                fill='white'
                d='M404.9,70.8c9.5,1.9,18.9,4.3,28.1,7.1L451.2,15C438,11,424.6,7.8,411,5.3L404.9,70.8z'
              />
              <path
                fill='white'
                d='M286.5,72.5c6.2-1.4,12.4-2.6,18.7-3.6c3.6-0.6,7.3-1.1,10.9-1.5l-7.3-65.1c-4.6,0.5-9.2,1.2-13.8,1.9
		c-9.4,1.5-18.7,3.4-27.8,5.6L286.5,72.5z'
              />
              <path
                fill='white'
                d='M66.5,326.8c0.8-9.8,2.1-19.4,3.8-29L7.1,279.6c-2.8,13.6-4.8,27.3-6,41.1L66.5,326.8z'
              />
              <path
                fill='white'
                d='M132.5,166.2c0.4-0.4,0.7-0.9,1.1-1.3c7.4-8.6,15.2-16.7,23.5-24.3l-41.8-50.4c-11.1,10-21.6,20.8-31.4,32.2
		c-0.8,1-1.6,2-2.5,3L132.5,166.2z'
              />
              <path
                fill='white'
                d='M100.1,213.6c4.8-8.8,10.1-17.4,15.8-25.7L64.8,147c-6.4,9-12.3,18.2-17.8,27.7c-1.6,2.8-3.1,5.6-4.7,8.4L100.1,213.6z'
              />
              <path
                fill='white'
                d='M195.5,35.8l31.7,57.4c10.7-5.1,21.8-9.6,33.1-13.3l-19.3-62.6C225.4,22.4,210.2,28.6,195.5,35.8z'
              />
              <path
                fill='white'
                d='M76.5,271.2c3.2-11.2,7.1-22.3,11.7-33l-58-30.6c-6.6,14.8-12.1,30-16.6,45.5L76.5,271.2z'
              />
              <path
                fill='white'
                d='M178,123.1c8.1-6.1,16.5-11.8,25.2-17.1l-31.7-57.3c-12.2,7.3-24.1,15.3-35.4,24L178,123.1z'
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
            strokeDashoffset={isUpdated && isIncrease ? updatedPercentage : percentage}
            strokeLinecap='round'
            style={ROTATION}
            mask={isUpdated ? 'url(#backgroundMask)' : 'url(#mask)'}
            className={classNames(
              backgroundColor,
              'stroke-current',
              !reduceMotion && 'transition-color transition-[stroke-dashoffset] duration-500',
            )}
          />
          {isUpdated && (
            <circle
              r={316}
              cx={RADIUS}
              cy={RADIUS}
              fill='transparent'
              strokeWidth={64}
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={isUpdated && !isIncrease ? updatedPercentage : percentage}
              strokeLinecap='round'
              style={ROTATION}
              mask='url(#mask)'
              className={classNames(
                foreGroundColor,
                'stroke-current',
                !reduceMotion && 'transition-color transition-[stroke-dashoffset] duration-500',
              )}
            />
          )}
        </svg>
      </div>
    </Tooltip>
  )
}
