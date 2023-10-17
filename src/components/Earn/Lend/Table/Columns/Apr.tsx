import React from 'react'

import AssetRate from 'components/Asset/AssetRate'
import Loading from 'components/Loading'
import { convertLiquidityRateToAPR } from 'utils/formatters'

export const APR_META = { accessorKey: 'marketLiquidityRate', header: 'APR' }

interface Props {
  marketLiquidityRate: number
  borrowEnabled: boolean
  isLoading: boolean
}
export default function Apr(props: Props) {
  if (props.isLoading) return <Loading />

  return (
    <AssetRate
      rate={convertLiquidityRateToAPR(props.marketLiquidityRate)}
      isEnabled={props.borrowEnabled}
      className='justify-end text-xs'
      type='apr'
      orientation='ltr'
    />
  )
}
