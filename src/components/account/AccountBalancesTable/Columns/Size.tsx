import { Row } from '@tanstack/react-table'
import classNames from 'classnames'
import { useMemo } from 'react'

import { getAmountChangeColor } from 'components/account/AccountBalancesTable/functions'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { MAX_AMOUNT_DECIMALS, MIN_AMOUNT } from 'constants/math'
import { formatAmountToPrecision } from 'utils/formatters'

export const SIZE_META = { accessorKey: 'size', header: 'Size', meta: { className: 'w-40' } }

interface Props {
  size: number
  amountChange: BigNumber
  denom: string
  type: PositionType
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
  const color = useMemo(() => getAmountChangeColor(type, amountChange), [amountChange, type])

  if (type === 'vault') return <p className='text-xs text-right number'>&ndash;</p>
  const className = classNames('text-xs text-right', color)
  const allowZero = !amountChange.isZero()

  if (size >= 1)
    return (
      <FormattedNumber
        className={className}
        amount={size}
        options={{ abbreviated: true, maxDecimals: MAX_AMOUNT_DECIMALS }}
      />
    )

  const formattedAmount = formatAmountToPrecision(size, MAX_AMOUNT_DECIMALS)
  const minimumAmount = allowZero ? 0 : MIN_AMOUNT
  const lowAmount = formattedAmount === 0 ? minimumAmount : formattedAmount

  return (
    <FormattedNumber
      className={className}
      smallerThanThreshold={!allowZero && formattedAmount < MIN_AMOUNT}
      amount={lowAmount}
      options={{
        maxDecimals: MAX_AMOUNT_DECIMALS,
        minDecimals: 0,
      }}
    />
  )
}
