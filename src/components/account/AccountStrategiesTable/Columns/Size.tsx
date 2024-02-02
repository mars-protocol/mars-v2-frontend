import classNames from 'classnames'
import { useMemo } from 'react'

import { getSizeChangeColor } from 'components/account/AccountStrategiesTable/functions'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { MAX_AMOUNT_DECIMALS, MIN_AMOUNT } from 'constants/math'
import useAllAssets from 'hooks/assets/useAllAssets'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { formatAmountToPrecision } from 'utils/formatters'

export const SIZE_META = { header: 'Size', meta: { className: 'w-40' } }

interface Props {
  size: BNCoin[]
  sizeChange: BNCoin[]
}

export default function Size(props: Props) {
  const { size, sizeChange } = props
  const color = useMemo(() => getSizeChangeColor(sizeChange), [sizeChange])
  const assets = useAllAssets()
  const className = classNames('text-xs text-right w-full', color)
  const minimumAmount = 0.0001

  const primarySymbol = assets.find(byDenom(size[0].denom))?.symbol
  const primarySize = size[0].amount.toString()
  const primaryFormattedAmount = formatAmountToPrecision(primarySize, MAX_AMOUNT_DECIMALS)
  const primaryLowAmount =
    primaryFormattedAmount === 0 ? minimumAmount : Math.max(primaryFormattedAmount, MIN_AMOUNT)

  const secondarySymbol = assets.find(byDenom(size[1].denom))?.symbol
  const secondarySize = size[1].amount.toString()
  const secondaryFormattedAmount = formatAmountToPrecision(secondarySize, MAX_AMOUNT_DECIMALS)
  const secondaryLowAmount =
    secondaryFormattedAmount === 0 ? minimumAmount : Math.max(secondaryFormattedAmount, MIN_AMOUNT)

  return (
    <div className='flex flex-wrap'>
      <FormattedNumber
        className={className}
        smallerThanThreshold={primaryFormattedAmount < MIN_AMOUNT}
        amount={primaryLowAmount}
        options={{
          maxDecimals: 4,
          minDecimals: 0,
          suffix: ` ${primarySymbol}`,
        }}
        animate
      />
      <FormattedNumber
        className={className}
        smallerThanThreshold={secondaryFormattedAmount < MIN_AMOUNT}
        amount={secondaryLowAmount}
        options={{
          maxDecimals: 4,
          minDecimals: 0,
          suffix: ` ${secondarySymbol}`,
        }}
        animate
      />
    </div>
  )
}
