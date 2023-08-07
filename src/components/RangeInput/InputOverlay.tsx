import { VerticalThreeLine } from 'components/Icons'

interface Props {
  value: number
  marginThreshold?: number
  max: number
}

const THUMB_WIDTH = 33

function InputOverlay({ max, value, marginThreshold }: Props) {
  const thumbPosPercent = max === 0 ? 0 : 100 / (max / value)
  const thumbPadRight = (thumbPosPercent / 100) * THUMB_WIDTH
  const markPosPercent = 100 / (max / (marginThreshold ?? 1))
  const markPadRight = (markPosPercent / 100) * THUMB_WIDTH
  const hasPastMarginThreshold = marginThreshold ? value >= marginThreshold : undefined

  return (
    <>
      <div
        className={className.marksWrapper}
        style={{
          backgroundImage:
            'linear-gradient(270deg, rgba(255, 97, 141, 0.89) 0%, rgba(66, 58, 70, 0.05) 100%)',
          backgroundSize: `${thumbPosPercent}%`,
        }}
      >
        {Array.from(Array(9).keys()).map((i) => (
          <div key={`mark-${i}`} className={className.mark} />
        ))}
        {marginThreshold && (
          <div
            key='margin-mark'
            className={className.marginMarkContainer}
            style={{ left: `calc(${markPosPercent}% - ${markPadRight}px)` }}
          >
            <div className={className.marginMark} />
            <div className={className.marginMarkOverlay}>
              <VerticalThreeLine className='h-2 w-[1px]' />
              <div className={!hasPastMarginThreshold ? 'opacity-50' : 'opacity-100'}>Margin</div>
            </div>
          </div>
        )}
      </div>
      <div
        className={className.inputThumbOverlay}
        style={{ left: `calc(${thumbPosPercent}% - ${thumbPadRight}px)` }}
      >
        {value}
      </div>
    </>
  )
}

const className = {
  inputThumbOverlay: `
    w-[33px] h-4 absolute text-[10px] top-[5px]
    pointer-events-none text-center font-bold
    bg-pink shadow-md border-b-0 border-1
    border-solid rounded-sm backdrop-blur-sm border-white/10
  `,
  mark: `w-1 h-1 bg-black rounded-full bg-opacity-30`,
  marginMark: `w-1 h-1 bg-white rounded-full`,
  marginMarkContainer: 'absolute w-[33px] flex justify-center',
  marginMarkOverlay: 'absolute top-2.5 flex-col text-xs w-[33px] items-center flex',
  marksWrapper: `absolute flex-1 flex w-full justify-evenly bg-no-repeat
    top-[8.5px] pointer-events-none pt-[2.5px] pb-[2.5px] rounded-lg`,
}

export default InputOverlay
