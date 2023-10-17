import React from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'

export const LTV_MAX_META = { accessorKey: 'ltv.max', header: 'Max LTV' }

interface Props {
  vault: Vault | DepositedVault
  isLoading: boolean
}
export default function MaxLtv(props: Props) {
  const { vault } = props
  if (props.isLoading) return <Loading />
  return (
    <FormattedNumber
      amount={vault.ltv.max * 100}
      options={{ minDecimals: 0, maxDecimals: 0, suffix: '%' }}
      className='text-xs'
      animate
    />
  )
}
