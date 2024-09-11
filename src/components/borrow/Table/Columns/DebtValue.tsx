import { Row } from '@tanstack/react-table'

import AmountAndValue from 'components/common/AmountAndValue'
import { BN_ZERO } from 'constants/math'
import { BN } from 'utils/helpers'

export const DEBT_VALUE_META = {
  id: 'accountDebtValue',
  accessorKey: 'accountDebtValue',
  header: 'Debt',
}

export const debtSortingFn = (
  a: Row<BorrowMarketTableData>,
  b: Row<BorrowMarketTableData>,
): number => {
  const debtValueA = BN(a.original?.accountDebtValue ?? 0)
  const debtValueB = BN(b.original?.accountDebtValue ?? 0)
  return debtValueA.minus(debtValueB).toNumber()
}

interface Props {
  asset: Asset
  debtAmount?: BigNumber
}
export default function DebtValue(props: Props) {
  return (
    <AmountAndValue asset={props.asset} amount={props.debtAmount ? props.debtAmount : BN_ZERO} />
  )
}
