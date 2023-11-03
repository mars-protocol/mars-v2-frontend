import { Row } from '@tanstack/react-table'
import React from 'react'

import { FormattedNumber } from 'components/FormattedNumber'

export const LEV_META = { accessorKey: 'leverage ', header: 'Leverage' }

interface Props {
  account: HLSAccountWithStrategy
}

export function leverageSortingFn(a: Row<HLSAccountWithStrategy>, b: Row<HLSAccountWithStrategy>) {
  return a.original.leverage - b.original.leverage
}

export default function MaxLeverage(props: Props) {
  return (
    <FormattedNumber
      amount={props.account.leverage}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: 'x' }}
      className='text-xs'
      animate
    />
  )
}
