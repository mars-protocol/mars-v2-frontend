import { Row } from '@tanstack/react-table'
import { useCallback } from 'react'

import useDepositedColumns from 'components/Borrow/Table/Columns/useDepositedColumns'
import MarketDetails from 'components/MarketDetails'
import Table from 'components/Table'
import ActionButtonRow from 'components/Table/ActionButtonRow'

import BorrowActionButtons from '../BorrowActionButtons'

type Props = {
  data: BorrowMarketTableData[]
  isLoading: boolean
}

export default function DepositedBorrowingsTable(props: Props) {
  const columns = useDepositedColumns({ isLoading: props.isLoading })

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
      initialSorting={[{ id: 'asset.name', desc: true }]}
      renderExpanded={renderExpanded}
    />
  )
}
