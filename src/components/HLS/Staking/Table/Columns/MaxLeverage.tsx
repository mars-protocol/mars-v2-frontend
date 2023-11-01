import React from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import { getLeverageFromLTV } from 'utils/helpers'

export const MAX_LEV_META = { accessorKey: 'hls.maxLeverage', header: 'Max Leverage' }
interface Props {
  strategy: HLSStrategy
}

export default function MaxLeverage(props: Props) {
  return (
    <FormattedNumber
      amount={getLeverageFromLTV(props.strategy.maxLTV)}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: 'x' }}
      className='text-xs'
      animate
    />
  )
}
