import * as RadixSlider from '@radix-ui/react-slider'
import React from 'react'

type Props = {
  className?: string
  value: number
  onChange: (value: number[]) => void
  onMaxClick: () => void
}

export const Slider = ({ className, value, onChange, onMaxClick }: Props) => {
  return (
    <div className={`relative flex flex-1 items-center ${className || ''}`}>
      <RadixSlider.Root
        className='relative flex h-[20px] w-full cursor-pointer touch-none select-none items-center'
        value={[value]}
        min={0}
        max={100}
        step={1}
        onValueChange={(value) => onChange(value)}
      >
        <RadixSlider.Track className='relative h-[6px] grow rounded-full bg-gray-400'>
          <RadixSlider.Range className='absolute h-[100%] rounded-full bg-blue-600' />
        </RadixSlider.Track>
        <RadixSlider.Thumb className='flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white !outline-none'>
          <div className='relative top-5 text-xs'>{value.toFixed(0)}%</div>
        </RadixSlider.Thumb>
      </RadixSlider.Root>
      <button
        className='ml-4 rounded-md bg-blue-600 py-1 px-2 text-xs font-semibold text-white'
        onClick={onMaxClick}
      >
        MAX
      </button>
    </div>
  )
}
