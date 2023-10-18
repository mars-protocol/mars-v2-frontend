import { Row } from '@tanstack/react-table'
import React, { useCallback } from 'react'

import Card from 'components/Card'
import { NAME_META } from 'components/Earn/Lend/Table/Columns/Name'
import useDepositedColumns from 'components/Earn/Lend/Table/Columns/useDepositedColumns'
import MarketDetails from 'components/MarketDetails'
import Table from 'components/Table'

type Props = {
  data: LendingMarketTableData[]
  isLoading: boolean
}

export default function DepositedLendsTable(props: Props) {
  const columns = useDepositedColumns({ isLoading: props.isLoading })

  const renderExpanded = useCallback(
    (row: Row<LendingMarketTableData>) => <MarketDetails row={row} type='borrow' />,
    [],
  )

  if (!props.data.length) return null

  return (
    <Card className='w-full h-fit bg-white/5' title={'Lent Assets'}>
      <Table
        columns={columns}
        data={props.data}
        initialSorting={[{ id: NAME_META.id, desc: true }]}
        renderExpanded={renderExpanded}
      />
    </Card>
  )
}
