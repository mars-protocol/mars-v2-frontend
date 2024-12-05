import { ColumnDef } from '@tanstack/react-table'

import Table from 'components/common/Table'

type Props = {
  data: DepositedHlsFarm[]
  columns: ColumnDef<DepositedHlsFarm>[]
  isLoading: boolean
}

export default function ActiveHlsFarmsTable(props: Props) {
  if (props.data.length === 0) return null

  return (
    <Table
      hideCard
      title='Active High Leverage Farms'
      columns={props.columns}
      data={props.data}
      initialSorting={[{ id: 'name', desc: false }]}
    />
  )
}
