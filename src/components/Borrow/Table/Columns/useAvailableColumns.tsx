import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import BorrowRate, { BORROW_RATE_META } from 'components/Borrow/Table/Columns/BorrowRate'
import Liquidity, { LIQUIDITY_META } from 'components/Borrow/Table/Columns/Liquidity'
import Manage, { MANAGE_META } from 'components/Borrow/Table/Columns/Manage'
import Name, { NAME_META } from 'components/Borrow/Table/Columns/Name'

export default function useAvailableColumns() {
  return useMemo<ColumnDef<BorrowMarketTableData>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name data={row.original} />,
      },
      {
        ...BORROW_RATE_META,
        cell: ({ row }) => <BorrowRate borrowRate={row.original.borrowRate} />,
      },
      {
        ...LIQUIDITY_META,
        cell: ({ row }) => <Liquidity data={row.original} />,
      },
      {
        ...MANAGE_META,
        cell: ({ row }) => <Manage isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [])
}
