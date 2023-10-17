import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apr, { APR_META } from 'components/Earn/Lend/Table/Columns/Apr'
import DepositCap, { DEPOSIT_CAP_META } from 'components/Earn/Lend/Table/Columns/DepositCap'
import Manage, { MANAGE_META } from 'components/Earn/Lend/Table/Columns/Manage'
import Name, { NAME_META } from 'components/Earn/Lend/Table/Columns/Name'

interface Props {
  isLoading: boolean
}

export default function useAvailableColumns(props: Props) {
  return useMemo<ColumnDef<LendingMarketTableData>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name asset={row.original.asset} />,
      },
      {
        ...APR_META,
        cell: ({ row }) => (
          <Apr
            borrowEnabled={row.original.borrowEnabled}
            marketLiquidityRate={row.original.marketLiquidityRate}
          />
        ),
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => <DepositCap data={row.original} />,
      },
      {
        ...MANAGE_META,
        cell: ({ row }) => <Manage isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [])
}
