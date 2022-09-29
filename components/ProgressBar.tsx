import React, { useEffect, useState } from 'react'
import { ArrowRightIcon } from '@heroicons/react/24/solid'

type Props = {
  value: number
}

const ProgressBar = ({ value }: Props) => {
  const percentageValue = `${(value * 100).toFixed(0)}%`
  const [newValue, setNewValue] = useState(0.77)

  useEffect(() => {
    setInterval(() => {
      // randomizing value between value and 1
      setNewValue(Math.random() * (1 - value) + value)
    }, 3000)
  }, [value])

  const percentageNewValue = `${(newValue * 100).toFixed(0)}%`

  return (
    <div className="relative z-0 h-4 w-[130px] rounded-full bg-black">
      <div
        className="absolute z-10 h-4 rounded-full bg-green-500"
        style={{ width: percentageValue }}
      />
      <div
        className="absolute h-4 rounded-full bg-red-500 transition-[width] duration-500"
        style={{ width: percentageNewValue }}
      />
      <div className="absolute z-20 flex w-full items-center justify-center gap-x-2 text-xs font-medium text-white">
        {percentageValue}
        <ArrowRightIcon className="h-3 w-3" />
        {percentageNewValue}
      </div>
    </div>
  )
}

export default ProgressBar
