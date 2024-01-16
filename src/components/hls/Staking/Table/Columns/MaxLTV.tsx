import React from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'

export const LTV_MAX_META = { accessorKey: 'maxLTV', header: 'Max LTV' }

interface Props {
  strategy: HLSStrategy
  isLoading: boolean
}
export default function MaxLtv(props: Props) {
  const { strategy } = props
  if (props.isLoading) return <Loading />
  return (
    <FormattedNumber
      amount={strategy.maxLTV * 100}
      options={{ minDecimals: 0, maxDecimals: 0, suffix: '%' }}
      className='text-xs'
      animate
    />
  )
}
