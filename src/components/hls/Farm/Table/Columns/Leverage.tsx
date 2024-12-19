import { Row } from '@tanstack/react-table'

import { FormattedNumber } from 'components/common/FormattedNumber'

export const LEV_META = { accessorKey: 'leverage ', header: 'Leverage' }

interface Props {
  leverage: number
}

export function leverageSortingFn(a: Row<DepositedHlsFarm>, b: Row<DepositedHlsFarm>) {
  return a.original.leverage - b.original.leverage
}

export default function Leverage(props: Props) {
  return (
    <FormattedNumber
      amount={props.leverage}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: 'x' }}
      className='text-xs'
    />
  )
}
