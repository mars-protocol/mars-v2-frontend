import { Row } from '@tanstack/react-table'

import AmountAndValue from 'components/common/AmountAndValue'
import { BN_ZERO } from 'constants/math'
import { BN } from 'utils/helpers'

export const DEPOSIT_VALUE_META = {
  id: 'accountLentValue',
  accessorKey: 'accountLentValue',
  header: 'Your Deposits',
}

export const depositedSortingFn = (
  a: Row<LendingMarketTableData>,
  b: Row<LendingMarketTableData>,
): number => {
  const depositValueA = BN(a.original?.accountLentValue ?? 0)
  const depositValueB = BN(b.original?.accountLentValue ?? 0)
  return depositValueA.minus(depositValueB).toNumber()
}

interface Props {
  asset: Asset
  lentAmount?: BigNumber
}
export default function DepositValue(props: Props) {
  return (
    <AmountAndValue asset={props.asset} amount={props.lentAmount ? props.lentAmount : BN_ZERO} />
  )
}
