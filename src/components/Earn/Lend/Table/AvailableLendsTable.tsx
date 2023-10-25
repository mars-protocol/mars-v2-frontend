import { Row } from '@tanstack/react-table'
import { useCallback } from 'react'

import LendingActionButtons from 'components/Earn/Lend/LendingActionButtons'
import { NAME_META } from 'components/Earn/Lend/Table/Columns/Name'
import useAvailableColumns from 'components/Earn/Lend/Table/Columns/useAvailableColumns'
import MarketDetails from 'components/MarketDetails'
import Table from 'components/Table'
import ActionButtonRow from 'components/Table/ActionButtonRow'

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
      isCard
    />
  )
}
