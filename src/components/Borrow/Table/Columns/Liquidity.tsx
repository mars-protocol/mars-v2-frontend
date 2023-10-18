import React from 'react'

import AmountAndValue from 'components/AmountAndValue'
import Loading from 'components/Loading'
import { BN_ZERO } from 'constants/math'
import { getEnabledMarketAssets } from 'utils/assets'

export const LIQUIDITY_META = { accessorKey: 'asset.name', header: 'Asset', id: 'symbol' }
interface Props {
  data: BorrowMarketTableData
}
export default function Liquidity(props: Props) {
  const { liquidity, asset: borrowAsset } = props.data
  const marketAssets = getEnabledMarketAssets()
  const asset = marketAssets.find((asset) => asset.denom === borrowAsset.denom)

  if (!asset) return null

  if (liquidity === null) {
    return <Loading />
  }

  return <AmountAndValue asset={asset} amount={liquidity.amount ?? BN_ZERO} />
}
