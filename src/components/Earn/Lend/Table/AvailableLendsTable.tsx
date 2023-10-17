import { Row } from '@tanstack/react-table'
import { Table as TanStackTable } from '@tanstack/table-core/build/lib/types'
import React, { useCallback } from 'react'

import Card from 'components/Card'
import { NAME_META } from 'components/Earn/Lend/Table/Columns/Name'
import useAvailableColumns from 'components/Earn/Lend/Table/Columns/useAvailableColumns'
import Table from 'components/Table'

import MarketDetails from '../../../MarketDetails'

type Props = {
  data: LendingMarketTableData[]
  isLoading: boolean
}

export default function AvailableLendsTable(props: Props) {
  const columns = useAvailableColumns({ isLoading: props.isLoading })

  const renderExpanded = useCallback(
    (row: Row<LendingMarketTableData>, table: TanStackTable<LendingMarketTableData>) => (
      <MarketDetails row={row} type='lend' />
    ),
    [],
  )

  if (!props.data.length) return null

  return (
    <Card className='w-full h-fit bg-white/5' title={'Available Markets'}>
      <Table
        columns={columns}
        data={props.data}
        initialSorting={[{ id: NAME_META.id, desc: true }]}
        renderExpanded={renderExpanded}
      />
    </Card>
  )
}
