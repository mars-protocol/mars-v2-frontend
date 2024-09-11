import DepositButton from './DepositButton'
import Manage from './Manage'
import WithdrawButton from './WithdrawButton'

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
  const isDeprecated = props.data.asset.isDeprecated

  if (hasDeposits && isDeprecated) return <WithdrawButton data={props.data} />
  if (hasDeposits) return <Manage data={props.data} />

  return <DepositButton data={props.data} />
}
