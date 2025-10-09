import { BN } from 'utils/helpers'

interface Props {
  currentLeverage: number
  maxAmount: BigNumber
  maxLeverage: number
  onChange: (leverage: number) => void
}

export function LeverageButtons(props: Props) {
  const leveragePresets = Array.from({ length: 5 }, (_, i) => {
    if (i === 0) return 1
    if (i === 4) return props.maxLeverage
    return BN(props.maxLeverage - 1)
      .div(4)
      .times(i)
      .plus(1)
      .toNumber()
  })

  return (
    <div className='flex justify-between gap-2 w-full'>
      {leveragePresets.map((leverage, index) => (
        <button
          key={`${index}-${leverage}`}
          onClick={() => props.onChange(leverage)}
          className='py-1 text-xs w-full rounded-sm bg-surface-light hover:bg-white/10 transition-colors'
        >
          {leverage.toFixed(1)}x
        </button>
      ))}
    </div>
  )
}
