import BorrowButton from 'components/v1/Table/borrowings/Columns/BorrowButton'
import Manage from 'components/v1/Table/borrowings/Columns/Manage'
import RepayButton from 'components/v1/Table/borrowings/Columns/RepayButton'

export const MANAGE_META = {
  accessorKey: 'manage',
  enableSorting: false,
  header: '',
}

interface Props {
  data: BorrowMarketTableData
}

export default function Action(props: Props) {
  const hasDebt = !props.data.accountDebtAmount?.isZero()
  const isDeprecatedAsset = props.data.asset.isDeprecated
  if (isDeprecatedAsset && hasDebt) return <RepayButton data={props.data} />
  if (hasDebt) return <Manage data={props.data} />

  return <BorrowButton data={props.data} />
}
