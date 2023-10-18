import { Row } from '@tanstack/react-table'
import { Table as TanstackTable } from '@tanstack/table-core/build/lib/types'
import { useCallback } from 'react'

import BorrowActionButtons from 'components/Borrow/BorrowActionButtons'
import useAvailableColumns from 'components/Borrow/Table/Columns/useAvailableColumns'
import MarketDetails from 'components/MarketDetails'
import Table from 'components/Table'
import ActionButtonRow from 'components/Table/ActionButtonRow'

type Props = {
  data: BorrowMarketTableData[]
  isLoading: boolean
}

export default function AvailableBorrowingsTable(props: Props) {
  const columns = useAvailableColumns({ isLoading: props.isLoading })

  const renderExpanded = useCallback(
    (row: Row<BorrowMarketTableData>, _: TanstackTable<BorrowMarketTableData>) => {
      const currentRow = row as Row<BorrowMarketTableData>
      return (
        <>
          <ActionButtonRow row={currentRow}>
            <BorrowActionButtons data={row.original} />
          </ActionButtonRow>
          <MarketDetails row={currentRow} type='borrow' />
        </>
      )
    },
    [],
  )

  if (!props.data.length) return null

  return (
    <Table
      title='Available to Borrow'
      columns={columns}
      data={props.data}
      initialSorting={[{ id: 'asset.name', desc: true }]}
      renderExpanded={renderExpanded}
    />
  )
}
