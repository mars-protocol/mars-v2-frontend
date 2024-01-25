import { Row } from '@tanstack/react-table'
import { useCallback } from 'react'

import BorrowActionButtons from 'components/borrow/BorrowActionButtons'
import { NAME_META } from 'components/borrow/Table/Columns/Name'
import useDepositedColumns from 'components/borrow/Table/Columns/useDepositedColumns'
import MarketDetails from 'components/common/MarketDetails'
import Table from 'components/common/Table'
import ActionButtonRow from 'components/common/Table/ActionButtonRow'

type Props = {
  data: BorrowMarketTableData[]
  isLoading: boolean
}

export default function DepositedBorrowingsTable(props: Props) {
  const columns = useDepositedColumns()

  const renderExpanded = useCallback((row: Row<BorrowMarketTableData>) => {
    const currentRow = row as Row<BorrowMarketTableData>
    return (
      <>
        <ActionButtonRow row={currentRow}>
          <BorrowActionButtons data={row.original} />
        </ActionButtonRow>
        <MarketDetails row={row} type='borrow' />
      </>
    )
  }, [])

  if (!props.data.length) return null

  return (
    <Table
      title='Borrowed Assets'
      columns={columns}
      data={props.data}
      initialSorting={[{ id: NAME_META.id, desc: false }]}
      renderExpanded={renderExpanded}
    />
  )
}