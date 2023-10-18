import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apr, { APR_META } from 'components/Earn/Lend/Table/Columns/Apr'
import DepositCap, { DEPOSIT_CAP_META } from 'components/Earn/Lend/Table/Columns/DepositCap'
import DepositValue, { DEPOSIT_VALUE_META } from 'components/Earn/Lend/Table/Columns/DepositValue'
import Manage, { MANAGE_META } from 'components/Earn/Lend/Table/Columns/Manage'
import Name, { NAME_META } from 'components/Earn/Lend/Table/Columns/Name'

interface Props {
  isLoading: boolean
}

export default function useDepositedColumns(props: Props) {
  return useMemo<ColumnDef<LendingMarketTableData>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name asset={row.original.asset} />,
      },
      {
        ...DEPOSIT_VALUE_META,
        cell: ({ row }) => (
          <DepositValue asset={row.original.asset} lentAmount={row.original.accountLentAmount} />
        ),
      },
      {
        ...APR_META,
        cell: ({ row }) => (
          <Apr
            isLoading={props.isLoading}
            borrowEnabled={row.original.borrowEnabled}
            marketLiquidityRate={row.original.marketLiquidityRate}
          />
        ),
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => <DepositCap isLoading={props.isLoading} data={row.original} />,
      },
      {
        ...MANAGE_META,
        cell: ({ row }) => <Manage isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [])
}
