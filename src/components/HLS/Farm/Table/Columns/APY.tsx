import React from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'
import useMarketBorrowings from 'hooks/useMarketBorrowings'

export const APY_META = { accessorKey: 'apy', header: 'APY Range' }

interface Props {
  vault: Vault
}

export default function Apy(props: Props) {
  const { vault } = props
  const { data: marketBorrowings } = useMarketBorrowings()

  const borrowRate = marketBorrowings.find((asset) => asset.denom === vault.hls?.borrowDenom)
    ?.borrowRate

  if (vault.apy === null || borrowRate === null) return <Loading />

  const APYs = [vault.apy, vault.apy * (vault.hls?.maxLeverage || 1) - (borrowRate || 0) * 100]

  return (
    <>
      <FormattedNumber
        amount={Math.min(...APYs)}
        options={{ minDecimals: 2, maxDecimals: 2, suffix: '-' }}
        className='text-xs inline'
        animate
      />
      <FormattedNumber
        amount={Math.max(...APYs)}
        options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
        className='text-xs inline'
        animate
      />
    </>
  )
}
