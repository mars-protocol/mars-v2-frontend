import { Row } from '@tanstack/react-table'
import { Table as TanstackTable } from '@tanstack/table-core/build/lib/types'
import React, { useCallback } from 'react'

import useAvailableColumns from 'components/Borrow/Table/Columns/useAvailableColumns'
import Card from 'components/Card'
import MarketDetails from 'components/MarketDetails'
import Table from 'components/Table'

type Props = {
  data: BorrowMarketTableData[]
  isLoading: boolean
}

export default function AvailableBorrowingsTable(props: Props) {
  const columns = useAvailableColumns({ isLoading: props.isLoading })

  const renderExpanded = useCallback(
    (row: Row<BorrowMarketTableData>, _: TanstackTable<BorrowMarketTableData>) => (
      <MarketDetails
        row={row as Row<BorrowMarketTableData | LendingMarketTableData>}
        type='borrow'
      />
    ),
    [],
  )

  if (!props.data.length) return null

  return (
    <Card className='w-full h-fit bg-white/5' title={'Available to Borrow'}>
      <Table
        columns={columns}
        data={props.data}
        initialSorting={[{ id: 'asset.name', desc: true }]}
        renderExpanded={renderExpanded}
      />
    </Card>
  )
}
