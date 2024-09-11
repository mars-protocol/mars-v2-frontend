import { Row } from '@tanstack/react-table'
import { Table as TanstackTable } from '@tanstack/table-core/build/lib/types'
import { useCallback } from 'react'

import MarketDetails from '../../common/MarketDetails'
import Table from '../../common/Table'
import { NAME_META } from './Columns/Name'
import useAvailableColumns from './Columns/useAvailableColumns'

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
