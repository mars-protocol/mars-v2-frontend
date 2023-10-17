import React from 'react'

import AssetRate from 'components/Asset/AssetRate'
import { convertLiquidityRateToAPR } from 'utils/formatters'

export const APR_META = { accessorKey: 'marketLiquidityRate', header: 'APR' }

interface Props {
  marketLiquidityRate: number
  borrowEnabled: boolean
}
export default function Apr(props: Props) {
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
