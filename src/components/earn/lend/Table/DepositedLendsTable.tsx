import { Row } from '@tanstack/react-table'
import { useCallback } from 'react'

import MarketDetails from 'components/common/MarketDetails'
import Table from 'components/common/Table'
import { DEPOSIT_VALUE_META } from 'components/earn/lend/Table/Columns/DepositValue'
import { NAME_META } from 'components/earn/lend/Table/Columns/Name'
import useDepositedColumns from 'components/earn/lend/Table/Columns/useDepositedColumns'

type Props = {
  data: LendingMarketTableData[]
  isLoading: boolean
  v1?: boolean
}

export default function DepositedLendsTable(props: Props) {
  const columns = useDepositedColumns({ isLoading: props.isLoading, v1: props.v1 })

  const renderExpanded = useCallback(
    (row: Row<LendingMarketTableData>) => <MarketDetails row={row} type='lend' />,
    [],
  )

  if (!props.data.length) return null

  return (
    <Table
      title={props.v1 ? 'Deposits' : 'Lent Assets'}
      columns={columns}
      data={props.data}
      initialSorting={
        props.v1
          ? [
              { id: DEPOSIT_VALUE_META.id, desc: true },
              { id: NAME_META.id, desc: false },
            ]
          : [{ id: NAME_META.id, desc: false }]
      }
      renderExpanded={renderExpanded}
    />
  )
}
