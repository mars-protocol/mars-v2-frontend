import { Row } from '@tanstack/react-table'
import classNames from 'classnames'

import { getAmountChangeColor } from 'components/Account/AccountBalancesTable/functions'
import { FormattedNumber } from 'components/FormattedNumber'
import { MAX_AMOUNT_DECIMALS, MIN_AMOUNT } from 'constants/math'
import { formatAmountToPrecision } from 'utils/formatters'

export const SIZE_META = { accessorKey: 'size', header: 'Size' }

interface Props {
  size: number
  amountChange: BigNumber
  denom: string
  type: 'deposits' | 'borrowing' | 'lending' | 'vault'
}

export const sizeSortingFn = (a: Row<AccountBalanceRow>, b: Row<AccountBalanceRow>): number => {
  const isVaultA = a.original.type === 'vault'
  const isVaultB = b.original.type === 'vault'

  const sizeA = isVaultA ? 0 : a.original.size
  const sizeB = isVaultB ? 0 : b.original.size

  return sizeA - sizeB
}

export default function Size(props: Props) {
  const { amountChange, type, size } = props

  if (type === 'vault') return <p className='text-xs text-right number'>&ndash;</p>

  const color = getAmountChangeColor(type, amountChange)
  const className = classNames('text-xs text-right', color)

  if (size >= 1)
    return (
      <FormattedNumber
        className={className}
        amount={size}
        options={{ abbreviated: true, maxDecimals: MAX_AMOUNT_DECIMALS }}
        animate
      />
    )

  const formattedAmount = formatAmountToPrecision(size, MAX_AMOUNT_DECIMALS)
  const lowAmount = formattedAmount === 0 ? 0 : Math.max(formattedAmount, MIN_AMOUNT)
  return (
    <FormattedNumber
      className={className}
      smallerThanThreshold={formattedAmount !== 0 && formattedAmount < MIN_AMOUNT}
      amount={lowAmount}
      options={{
        maxDecimals: MAX_AMOUNT_DECIMALS,
        minDecimals: 0,
      }}
      animate
    />
  )
}
