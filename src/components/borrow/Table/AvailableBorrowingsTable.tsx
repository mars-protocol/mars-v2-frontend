import { Row, Table as TanstackTable } from '@tanstack/react-table'
import { useCallback } from 'react'

import { NAME_META } from 'components/borrow/Table/Columns/Name'
import useAvailableColumns from 'components/borrow/Table/Columns/useAvailableColumns'
import MarketDetails from 'components/common/MarketDetails'
import Table from 'components/common/Table'

type Props = {
  data: BorrowMarketTableData[]
  isLoading: boolean
}

export default function AvailableBorrowingsTable(props: Props) {
  const columns = useAvailableColumns({ v1: false })

  const renderExpanded = useCallback(
    (row: Row<BorrowMarketTableData>, _: TanstackTable<BorrowMarketTableData>) => {
      const currentRow = row as Row<BorrowMarketTableData>
      return <MarketDetails row={currentRow} type='borrow' />
    },
    [],
  )

  if (!props.data.length) return null

  return (
    <Table
      title='Available to Borrow'
      columns={columns}
      data={props.data}
      initialSorting={[{ id: NAME_META.id, desc: false }]}
      renderExpanded={renderExpanded}
    />
  )
}
