import React from 'react'

import Table from 'components/common/Table'
import useDepositedColumns from 'components/earn/farm/Table/Columns/useDepositedColumns'

type Props = {
  data: DepositedVault[]
  isLoading: boolean
}

export default function DepositedVaultsTable(props: Props) {
  const columns = useDepositedColumns({ isLoading: props.isLoading })

  return (
    <Table
      title='Deposited Vaults'
      columns={columns}
      data={props.data}
      initialSorting={[{ id: 'name', desc: true }]}
    />
  )
}
