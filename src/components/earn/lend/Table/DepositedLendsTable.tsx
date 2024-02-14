import { Row } from '@tanstack/react-table'
import { useCallback } from 'react'

import MarketDetails from 'components/common/MarketDetails'
import Table from 'components/common/Table'
import { NAME_META } from 'components/earn/lend/Table/Columns/Name'
import useDepositedColumns from 'components/earn/lend/Table/Columns/useDepositedColumns'

type Props = {
  data: LendingMarketTableData[]
  isLoading: boolean
}

export default function DepositedLendsTable(props: Props) {
  const columns = useDepositedColumns({ isLoading: props.isLoading })

  const renderExpanded = useCallback(
    (row: Row<LendingMarketTableData>) => <MarketDetails row={row} type='lend' />,
    [],
  )

  if (!props.data.length) return null

  return (
    <Table
      title='Lent Assets'
      columns={columns}
      data={props.data}
      initialSorting={[{ id: NAME_META.id, desc: false }]}
      renderExpanded={renderExpanded}
    />
  )
}
