import { Row } from '@tanstack/react-table'
import { Table as TanStackTable } from '@tanstack/table-core/build/lib/types'
import React, { useCallback } from 'react'

import useDepositedColumns from 'components/Borrow/Table/Columns/useDepositedColumns'
import Card from 'components/Card'
import MarketDetails from 'components/MarketAssetTable/MarketDetails'
import Table from 'components/Table'

type Props = {
  data: BorrowMarketTableData[]
  isLoading: boolean
}

export default function DepositedBorrowingsTable(props: Props) {
  const columns = useDepositedColumns({ isLoading: props.isLoading })

  const renderExpanded = useCallback(
    (
      row: Row<BorrowMarketTableData | LendingMarketTableData>,
      table: TanStackTable<BorrowMarketTableData>,
    ) => <MarketDetails row={row} type='borrow' />,
    [],
  )

  if (!props.data.length) return null

  return (
    <Card className='w-full h-fit bg-white/5' title='Borrowed Assets'>
      <Table
        columns={columns}
        data={props.data}
        initialSorting={[{ id: 'asset.name', desc: true }]}
        renderExpanded={renderExpanded}
      />
    </Card>
  )
}
