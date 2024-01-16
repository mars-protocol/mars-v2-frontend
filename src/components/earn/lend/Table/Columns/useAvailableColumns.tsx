import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'
import DepositCap, {
  DEPOSIT_CAP_META,
  marketDepositCapSortingFn,
} from 'components/earn/lend/Table/Columns/DepositCap'
import Manage, { MANAGE_META } from 'components/earn/lend/Table/Columns/Manage'
import Name, { NAME_META } from 'components/earn/lend/Table/Columns/Name'

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
            apy={row.original.apy.deposit}
          />
        ),
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => <DepositCap isLoading={props.isLoading} data={row.original} />,
        sortingFn: marketDepositCapSortingFn,
      },
      {
        ...MANAGE_META,
        cell: ({ row }) => <Manage isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [props.isLoading])
}
