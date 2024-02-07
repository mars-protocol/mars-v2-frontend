import React from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import useMarket from 'hooks/markets/useMarket'

export const APY_META = { accessorKey: 'apy', header: 'APY Range' }

interface Props {
  vault: Vault
}

export default function Apy(props: Props) {
  const { vault } = props
  const borrowRate = useMarket(vault.hls?.borrowDenom || '')?.apy.borrow

  if (vault.apy === undefined || borrowRate === null) return <Loading />
  if (vault.apy === null) return <Text size='xs'>N/A</Text>

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
