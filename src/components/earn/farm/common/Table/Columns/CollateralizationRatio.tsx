import React from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'

export const COLL_META = { accessorKey: 'collatRatio', header: 'Collat. Ratio' }

interface Props {
  amount: number
}

export default function CollateralizationRatio(props: Props) {
  return (
    <FormattedNumber
      amount={props.amount * 100}
      options={{ suffix: '%', maxDecimals: 0, minDecimals: 0 }}
      className='text-xs'
    />
  )
}
