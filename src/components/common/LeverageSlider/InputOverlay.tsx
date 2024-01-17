import classNames from 'classnames'

import { VerticalThreeLine } from 'components/common/Icons'
import { LeverageSliderType } from 'components/common/LeverageSlider'
import { formatValue } from 'utils/formatters'

interface Props {
  value: number
  marginThreshold?: number
  max: number
  type: LeverageSliderType
}

const THUMB_WIDTH = 33

function InputOverlay({ max, value, marginThreshold, type }: Props) {
  const thumbPosPercent = max === 0 ? 0 : 100 / (max / value)
  const thumbPadRight = (thumbPosPercent / 100) * THUMB_WIDTH
  const markPosPercent = 100 / (max / (marginThreshold ?? 1))
  const markPadRight = (markPosPercent / 100) * THUMB_WIDTH
  const hasPastMarginThreshold = marginThreshold ? value >= marginThreshold : undefined

  return (
    <>
      <div
        className={classNames(
          'absolute flex-1 flex w-full justify-evenly  top-[8.5px] pointer-events-none pt-[2.5px] pb-[2.5px] rounded-lg',
          'before:absolute',
          'before:top-0 before:bottom-0 before:right-0 before:left-0',
          'slider-mask',
          type === 'long' && 'before:gradient-slider-green',
          type === 'short' && 'before:gradient-slider-red',
          type === 'margin' && 'before:gradient-slider-pink',
        )}
        style={{ width: `${thumbPosPercent}%` }}
      >
        {Array.from(Array(9).keys()).map((i) => (
          <div key={`mark-${i}`} className='w-1 h-1 bg-black rounded-full bg-opacity-30' />
        ))}
        {marginThreshold !== undefined && (
          <div
            key='margin-mark'
            className='absolute w-[33px] flex justify-center'
            style={{ left: `calc(${markPosPercent}% - ${markPadRight}px)` }}
          >
            <div className='w-1 h-1 bg-white rounded-full' />
            <div className='absolute top-2.5 flex-col text-xs w-[33px] items-center flex'>
              <VerticalThreeLine className='h-2 w-[1px]' />
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
          type === 'margin' && 'bg-pink',
        )}
        style={{ left: `calc(${thumbPosPercent}% - ${thumbPadRight}px)` }}
      >
        {formatValue(value, {
          maxDecimals: 2,
          abbreviated: true,
          rounded: true,
          suffix: type !== 'margin' ? 'x' : '',
        })}
      </div>
    </>
  )
}

export default InputOverlay
