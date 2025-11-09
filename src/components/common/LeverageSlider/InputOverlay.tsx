import classNames from 'classnames'

import { VerticalThreeLine } from 'components/common/Icons'
import { LeverageSliderType } from 'components/common/LeverageSlider'
import { formatValue } from 'utils/formatters'

interface Props {
  value: number
  marginThreshold?: number
  max: number
  type: LeverageSliderType
  min: number
}

const THUMB_WIDTH = 33

function InputOverlay({ max, value, marginThreshold, type, min }: Props) {
  const thumbPosPercent = Math.max(
    0,
    Math.min(100, max === 0 ? 0 : 100 / ((max - min) / (value - min))),
  )
  const thumbPadRight = (thumbPosPercent / 100) * THUMB_WIDTH
  const markPosPercent = Math.max(0, Math.min(100, 100 / (max / (marginThreshold ?? 1))))
  const markPadRight = (markPosPercent / 100) * THUMB_WIDTH
  const hasPastMarginThreshold = marginThreshold ? value >= marginThreshold : undefined
  const isMarginNearMax = markPosPercent > 85

  return (
    <>
      <div
        className={classNames(
          'absolute flex h-2 w-full top-[9px] pointer-events-none rounded-lg',
          'before:absolute',
          'before:top-0 before:bottom-0 before:right-0 before:left-0',
          'slider-mask',
          type === 'long' && 'before:gradient-slider-green',
          type === 'short' && 'before:gradient-slider-red',
          type === 'margin' && 'before:gradient-slider-martian-red',
        )}
        style={{ width: `${thumbPosPercent}%` }}
      />
      <div className='absolute flex w-full h-2 pointer-events-none top-[11px] justify-evenly'>
        {Array.from(Array(9).keys()).map((i) => (
          <div key={`mark-${i}`} className='w-1 h-1 bg-black/30 rounded-full' />
        ))}
        {marginThreshold !== undefined && (
          <div
            key='margin-mark'
            className='absolute w-[33px] flex justify-center'
            style={{ left: `calc(${markPosPercent}% - ${markPadRight}px)` }}
          >
            <div className='w-1 h-1 bg-white rounded-full' />
            <div
              className={classNames(
                'absolute top-2.5 flex flex-col items-center text-xs w-[33px]',
                isMarginNearMax && 'pt-4',
              )}
            >
              <VerticalThreeLine className='h-2 w-px' />
              <div className={!hasPastMarginThreshold ? 'opacity-50' : 'opacity-100'}>Margin</div>
            </div>
          </div>
        )}
      </div>
      <div
        className={classNames(
          'w-[36px] h-4.5 absolute text-[10px] top-[3.5px]',
          'pointer-events-none text-center font-bold',
          'border rounded-sm border-white/20',
          type === 'long' && 'bg-green',
          type === 'short' && 'bg-error',
          type === 'margin' && 'bg-martian-red',
        )}
        style={{ left: `calc(${thumbPosPercent}% - ${thumbPadRight}px)` }}
      >
        {formatValue(value, {
          minDecimals: type !== 'margin' ? 1 : 2,
          maxDecimals: type !== 'margin' ? 1 : 2,
          abbreviated: true,
          rounded: true,
          suffix: type !== 'margin' ? 'x' : '',
        })}
      </div>
    </>
  )
}

export default InputOverlay
