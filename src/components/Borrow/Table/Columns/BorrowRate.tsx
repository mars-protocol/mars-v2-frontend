import React from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'

export const BORROW_RATE_META = { accessorKey: 'borrowRate', header: 'Borrow Rate' }

interface Props {
  borrowRate: number | null
}

export default function BorrowRate(props: Props) {
  if (props.borrowRate === null) {
    return <Loading />
  }

  return (
    <FormattedNumber
      className='justify-end text-xs'
      amount={props.borrowRate}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
      animate
    />
  )
}
