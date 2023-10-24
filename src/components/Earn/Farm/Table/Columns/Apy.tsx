import React from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'

export const APY_META = { accessorKey: 'apy', header: 'APY' }

interface Props {
  vault: Vault | DepositedVault
}

export default function Apy(props: Props) {
  const { vault } = props

  if (vault.apy === null) return <Loading />

  return (
    <FormattedNumber
      amount={vault.apy ?? 0}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
      className='text-xs'
      animate
    />
  )
}
