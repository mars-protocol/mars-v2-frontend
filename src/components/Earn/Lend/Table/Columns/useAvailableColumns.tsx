import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/Earn/Lend/Table/Columns/Apy'
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
        ...APY_META,
        cell: ({ row }) => (
          <Apy
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
  }, [props.isLoading])
}
