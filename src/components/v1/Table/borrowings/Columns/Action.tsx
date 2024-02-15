import BorrowButton from 'components/borrow/Table/Columns/BorrowButton'
import Manage from 'components/borrow/Table/Columns/Manage'

export const MANAGE_META = {
  accessorKey: 'manage',
  enableSorting: false,
  header: '',
}

interface Props {
  data: BorrowMarketTableData
}

export default function Action(props: Props) {
  const hasDebt = !props.data.accountDebtAmount?.isZero() ?? false

  if (hasDebt) return <Manage data={props.data} v1 />

  return <BorrowButton data={props.data} v1 />
}
