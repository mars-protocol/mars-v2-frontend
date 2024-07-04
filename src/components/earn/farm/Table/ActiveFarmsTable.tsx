import { ColumnDef } from '@tanstack/react-table'

import Table from 'components/common/Table'

type Props = {
  data: DepositedFarm[]
  columns: ColumnDef<DepositedFarm>[]
  isLoading: boolean
}

export default function ActiveFarmsTable(props: Props) {
  if (props.data.length === 0) return null

  return (
    <Table
      hideCard
      title='Deposited and Staked Farms'
      columns={props.columns}
      data={props.data}
      initialSorting={[{ id: 'name', desc: true }]}
    />
  )
}
