import { Row } from '@tanstack/react-table'
import { useCallback } from 'react'

import LendingActionButtons from 'components/earn/lend/LendingActionButtons'
import { NAME_META } from 'components/earn/lend/Table/Columns/Name'
import useAvailableColumns from 'components/earn/lend/Table/Columns/useAvailableColumns'
import MarketDetails from 'components/common/MarketDetails'
import Table from 'components/common/Table'
import ActionButtonRow from 'components/common/Table/ActionButtonRow'

type Props = {
  data: LendingMarketTableData[]
  isLoading: boolean
}

export default function AvailableLendsTable(props: Props) {
  const columns = useAvailableColumns({ isLoading: props.isLoading })

  const renderExpanded = useCallback(
    (row: Row<LendingMarketTableData>) => (
      <>
        <ActionButtonRow row={row}>
          <LendingActionButtons data={row.original} />
        </ActionButtonRow>
        <MarketDetails row={row} type='lend' />
      </>
    ),
    [],
  )

  if (!props.data.length) return null

  return (
    <Table
      title='Available Markets'
      columns={columns}
      data={props.data}
      initialSorting={[{ id: NAME_META.id, desc: false }]}
      renderExpanded={renderExpanded}
    />
  )
}
