import React from 'react'

type Props = {
  value: number
}

const ProgressBar = ({ value }: Props) => {
  const percentageValue = `${(value * 100).toFixed(0)}%`

  return (
    <div className="relative z-0 h-4 w-[130px] rounded-full bg-black">
      <div
        className="absolute z-10 h-4 rounded-full bg-green-500"
        style={{ width: percentageValue }}
      />
      <div className="absolute z-20 flex w-full items-center justify-center gap-x-2 text-xs font-medium text-white">
        {percentageValue}
      </div>
    </div>
  )
}

export default ProgressBar
