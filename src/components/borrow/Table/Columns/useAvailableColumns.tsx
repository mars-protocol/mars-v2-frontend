import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import BorrowRate, { BORROW_RATE_META } from 'components/borrow/Table/Columns/BorrowRate'
import Liquidity, {
  LIQUIDITY_META,
  liquiditySortingFn,
} from 'components/borrow/Table/Columns/Liquidity'
import Manage, { MANAGE_META } from 'components/borrow/Table/Columns/Manage'
import Name, { NAME_META } from 'components/borrow/Table/Columns/Name'

export default function useAvailableColumns() {
  return useMemo<ColumnDef<BorrowMarketTableData>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name data={row.original} />,
      },
      {
        ...BORROW_RATE_META,
        cell: ({ row }) => <BorrowRate borrowRate={row.original.apy.borrow} />,
      },
      {
        ...LIQUIDITY_META,
        cell: ({ row }) => <Liquidity data={row.original} />,
        sortingFn: liquiditySortingFn,
      },
      {
        ...MANAGE_META,
        cell: ({ row }) => <Manage isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [])
}
