import BorrowButton from 'components/v1/Table/borrowings/Columns/BorrowButton'
import Manage from 'components/v1/Table/borrowings/Columns/Manage'

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

  if (hasDebt) return <Manage data={props.data} />

  return <BorrowButton data={props.data} />
}
