import React from 'react'

import { FormattedNumber } from 'components/FormattedNumber'

export const MAX_LEV_META = { accessorKey: 'maxLeverage', header: 'Max Leverage' }

interface Props {
  strategy: HLSStrategy
}

export default function MaxLeverage(props: Props) {
  return (
    <FormattedNumber
      amount={props.strategy.maxLeverage}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: 'x' }}
      className='text-xs'
      animate
    />
  )
}
