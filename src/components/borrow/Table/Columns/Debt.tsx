import { Row } from '@tanstack/react-table'

import AmountAndValue from 'components/common/AmountAndValue'
import { BN_ZERO } from 'constants/math'
import useMarketEnabledAssets from 'hooks/assets/useMarketEnabledAssets'
import { byDenom } from 'utils/array'

export const DEBT_META = {
  accessorKey: 'debt',
  header: 'Debt',
}

export const debtSortingFn = (
  a: Row<BorrowMarketTableData>,
  b: Row<BorrowMarketTableData>,
): number => {
  const assetA = a.original.asset
  const assetB = b.original.asset
  if (!a.original.debt || !b.original.debt) return 0
  const assetAPrice = (a.original.liquidity?.value ?? BN_ZERO).div(
    a.original.liquidity?.amount ?? BN_ZERO,
  )
  const assetBPrice = (b.original.liquidity?.value ?? BN_ZERO).div(
    b.original.liquidity?.amount ?? BN_ZERO,
  )
  const debtA = a.original.debt.times(assetAPrice).shiftedBy(-assetA.decimals)
  const debtB = b.original.debt.times(assetBPrice).shiftedBy(-assetB.decimals)
  return debtA.minus(debtB).toNumber()
}

interface Props {
  data: BorrowMarketTableData
}

export default function Debt(props: Props) {
  const marketAssets = useMarketEnabledAssets()
  const asset = marketAssets.find(byDenom(props.data.asset.denom))

  if (!asset) return null

  return <AmountAndValue asset={asset} amount={props.data?.debt ?? BN_ZERO} />
}
