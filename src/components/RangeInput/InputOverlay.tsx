import { VerticalThreeLine } from 'components/Icons'

interface Props {
  value: number
  marginThreshold?: number
  max: number
}

function InputOverlay({ max, value, marginThreshold }: Props) {
  // 33 is the thumb width
  const thumbPosPercent = 100 / (max / value)
  const thumbPadRight = (thumbPosPercent / 100) * 33
  const markPosPercent = 100 / (max / (marginThreshold ?? 1))
  const markPadRight = (markPosPercent / 100) * 33

  return (
    <>
      <div
        className={className.marksWrapper}
        style={{
          backgroundImage:
            'linear-gradient(270deg, rgba(255, 97, 141, 0.89) 0%, rgba(66, 58, 70, 0.05) 100%)',
          backgroundSize: `${thumbPosPercent}%`,
          backgroundRepeat: 'no-repeat',
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
              <VerticalThreeLine />
              <div>Margin</div>
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
    w-[33px] h-[16px] absolute text-[10px] top-[5px]
    pointer-events-none text-center font-bold
    bg-[#DE587F] shadow-md border-b-0 border-[1px]
    border-solid rounded-sm backdrop-blur-sm border-white/[.1]
  `,
  mark: `w-[4px] h-[4px] bg-black rounded-full bg-opacity-30`,
  marginMark: `w-[4px] h-[4px] bg-white rounded-full`,
  marginMarkContainer: 'absolute w-[33px] flex justify-center',
  marginMarkOverlay: 'absolute top-[10px] flex-col text-xs w-[33px] items-center flex',
  marksWrapper: `absolute flex-1 flex w-full justify-evenly 
    top-[8.5px] pointer-events-none pt-[2.5px] pb-[2.5px] rounded-lg`,
}

export default InputOverlay
