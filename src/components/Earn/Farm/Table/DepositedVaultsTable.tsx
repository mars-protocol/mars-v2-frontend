import React from 'react'

import Card from 'components/Card'
import useDepositedColumns from 'components/Earn/Farm/Table/Columns/useDepositedColumns'
import Table from 'components/Table'

type Props = {
  data: DepositedVault[]
  isLoading: boolean
}

export default function DepositedVaultsTable(props: Props) {
  const columns = useDepositedColumns({ isLoading: props.isLoading })
  return (
    <Card className='w-full h-fit bg-white/5' title={'Deposited vaults'}>
      <Table columns={columns} data={props.data} initialSorting={[{ id: 'name', desc: true }]} />
    </Card>
  )
}
