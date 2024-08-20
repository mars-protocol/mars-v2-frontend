import { ColumnDef } from '@tanstack/react-table'

import Table from 'components/common/Table'

type Props = {
  data: DepositedAstroLp[]
  columns: ColumnDef<DepositedAstroLp>[]
  isLoading: boolean
}

export default function ActiveAstroLpsTable(props: Props) {
  if (props.data.length === 0) return null

  return (
    <Table
      hideCard
      title='Deposited and Staked AstroLps'
      columns={props.columns}
      data={props.data}
      initialSorting={[{ id: 'name', desc: false }]}
    />
  )
}
