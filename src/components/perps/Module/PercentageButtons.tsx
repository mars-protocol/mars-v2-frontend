import Text from 'components/common/Text'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'

interface PercentageButtonsProps {
  currentPrice: BigNumber
  setTargetPrice: (price: BigNumber) => void
  isShort: boolean
  isTakeProfit: boolean
}

export function PercentageButtons({
  currentPrice,
  setTargetPrice,
  isShort,
  isTakeProfit,
}: PercentageButtonsProps) {
  const percentages = [10, 20, 50, 75]

  const handlePercentageClick = (percentage: number) => {
    if (!currentPrice || currentPrice.isZero()) return

    let multiplier

    if (isTakeProfit) {
      multiplier = isShort ? -1 : 1
    } else {
      multiplier = isShort ? 1 : -1
    }

    const newPrice = currentPrice.times(1 + (multiplier * percentage) / 100)
    const normalizedPrice = newPrice.shiftedBy(PRICE_ORACLE_DECIMALS)

    setTargetPrice(normalizedPrice)
  }

  let labelText = ''
  if (isTakeProfit) {
    labelText = isShort ? 'Percentage price decrease' : 'Percentage price increase'
  } else {
    labelText = isShort ? 'Percentage price increase' : 'Percentage price decrease'
  }

  return (
    <div className='mt-3'>
      <Text size='xs' className='text-left text-white/60 mb-1'>
        {labelText}:
      </Text>
      <div className='flex justify-between gap-2 mb-3'>
        {percentages.map((percentage) => (
          <button
            key={`percentage-${percentage}`}
            onClick={() => handlePercentageClick(percentage)}
            className='flex-1 px-1 py-1.5 text-xs rounded-sm bg-surface-light hover:bg-white/10 transition-colors'
          >
            {percentage}%
          </button>
        ))}
      </div>
    </div>
  )
}
