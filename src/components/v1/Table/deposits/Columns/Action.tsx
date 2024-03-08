import DepositButton from 'components/v1/Table/deposits/Columns/DepositButton'
import Manage from 'components/v1/Table/deposits/Columns/Manage'

export const MANAGE_META = {
  accessorKey: 'manage',
  enableSorting: false,
  header: '',
}

interface Props {
  data: LendingMarketTableData
}
export default function Action(props: Props) {
  const hasDeposits = !props.data.accountLentAmount?.isZero() ?? false

  if (hasDeposits) return <Manage data={props.data} />

  return <DepositButton data={props.data} />
}
