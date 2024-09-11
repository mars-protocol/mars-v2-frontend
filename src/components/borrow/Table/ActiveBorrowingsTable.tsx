import { Row } from '@tanstack/react-table'
import { useCallback } from 'react'

import MarketDetails from 'components/common/MarketDetails'
import Table from 'components/common/Table'
import { DEBT_VALUE_META } from './Columns/DebtValue'
import { NAME_META } from './Columns/Name'
import useBorrowingsColumns from './Columns/useActiveColumns'

type Props = {
  data: BorrowMarketTableData[]
  isLoading: boolean
  v1?: boolean
}

export default function ActiveBorrowingsTable(props: Props) {
  const columns = useBorrowingsColumns({ v1: props.v1 })

  const renderExpanded = useCallback((row: Row<BorrowMarketTableData>) => {
    return <MarketDetails row={row} type='borrow' />
  }, [])

  if (!props.data.length) return null

  return (
    <Table
      title={props.v1 ? 'Borrowings' : 'Borrowed Assets'}
      columns={columns}
      data={props.data}
      initialSorting={
        props.v1
          ? [
              { id: DEBT_VALUE_META.id, desc: true },
              { id: NAME_META.id, desc: false },
            ]
          : [{ id: NAME_META.id, desc: false }]
      }
      renderExpanded={renderExpanded}
    />
  )
}
