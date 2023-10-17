import React from 'react'

import AmountAndValue from 'components/AmountAndValue'
import { BN_ZERO } from 'constants/math'
import { getEnabledMarketAssets } from 'utils/assets'

export const DEBT_META = {
  accessorKey: 'debt',
  header: 'Debt',
}
interface Props {
  data: BorrowMarketTableData
}

export default function Debt(props: Props) {
  const marketAssets = getEnabledMarketAssets()
  const asset = marketAssets.find((asset) => asset.denom === props.data.asset.denom)

  if (!asset) return null

  return <AmountAndValue asset={asset} amount={props.data?.debt ?? BN_ZERO} />
}
