import React from 'react'

import useAvailableColumns from 'components/Earn/Farm/Table/Columns/useAvailableColumns'
import Table from 'components/Table'

type Props = {
  data: Vault[]
  isLoading: boolean
}

export default function AvailableVaultsTable(props: Props) {
  const columns = useAvailableColumns({ isLoading: props.isLoading })

  return (
    <Table
      title='Available vaults'
      columns={columns}
      data={props.data}
      initialSorting={[{ id: 'name', desc: true }]}
    />
  )
}
