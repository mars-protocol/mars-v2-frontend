import React from 'react'

import Card from 'components/Card'
import useAvailableColumns from 'components/Earn/Farm/Table/Columns/useAvailableColumns'
import Table from 'components/Table'

type Props = {
  data: Vault[]
  isLoading: boolean
}

export default function AvailableVaultsTable(props: Props) {
  const columns = useAvailableColumns({ isLoading: props.isLoading })
  return (
    <Card className='w-full h-fit bg-white/5' title={'Available vaults'}>
      <Table columns={columns} data={props.data} initialSorting={[{ id: 'name', desc: true }]} />
    </Card>
  )
}
