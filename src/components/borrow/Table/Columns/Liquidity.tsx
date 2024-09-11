import { Row } from '@tanstack/react-table'

import AmountAndValue from 'components/common/AmountAndValue'
import { BN_ZERO } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import { demagnify } from 'utils/formatters'

export const LIQUIDITY_META = {
  accessorKey: 'liquidity',
  header: 'Liquidity Available',
  id: 'liquidity',
  meta: { className: 'min-w-30' },
}

export const liquiditySortingFn = (
  a: Row<BorrowMarketTableData>,
  b: Row<BorrowMarketTableData>,
): number => {
  const assetA = a.original.asset
  const assetB = b.original.asset
  const liquidityA = demagnify(a.original.liquidity ?? 0, assetA)
  const liquidityB = demagnify(b.original.liquidity ?? 0, assetB)

  return liquidityA - liquidityB
}

interface Props {
  data: BorrowMarketTableData
}

export default function Liquidity(props: Props) {
  const { liquidity, asset: borrowAsset } = props.data
  const asset = useAsset(borrowAsset.denom)

  if (!asset) return null

  return <AmountAndValue asset={asset} amount={liquidity ?? BN_ZERO} />
}
