import { Row } from '@tanstack/react-table'
import { Table as TanStackTable } from '@tanstack/table-core/build/lib/types'
import React, { useCallback } from 'react'

import useDepositedColumns from 'components/earn/farm/Table/Columns/useDepositedColumns'
import VaultExpanded from 'components/earn/farm/VaultExpanded'
import Table from 'components/common/Table'

type Props = {
  data: DepositedVault[]
  isLoading: boolean
}

export default function DepositedVaultsTable(props: Props) {
  const columns = useDepositedColumns({ isLoading: props.isLoading })

  const renderExpanded = useCallback(
    (row: Row<DepositedVault>, table: TanStackTable<DepositedVault>) => (
      <VaultExpanded row={row} resetExpanded={table.resetExpanded} />
    ),
    [],
  )

  return (
    <Table
      title='Deposited Vaults'
      columns={columns}
      data={props.data}
      initialSorting={[{ id: 'name', desc: true }]}
      renderExpanded={renderExpanded}
    />
  )
}
