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
    <div className='flex justify-between'>
      {leveragePresets.map((leverage, index) => (
        <button
          key={`${index}-${leverage}`}
          onClick={() => props.onChange(leverage)}
          className='w-12 !border:none rounded-sm py-1 text-xs hover:bg-white/10'
        >
          {leverage.toFixed(1)}x
        </button>
      ))}
    </div>
  )
}
