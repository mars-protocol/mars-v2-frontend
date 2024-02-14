import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import BorrowRate, { BORROW_RATE_META } from 'components/borrow/Table/Columns/BorrowRate'
import Chevron, { CHEVRON_META } from 'components/borrow/Table/Columns/Chevron'
import Debt, { DEBT_META, debtSortingFn } from 'components/borrow/Table/Columns/Debt'
import Liquidity, {
  LIQUIDITY_META,
  liquiditySortingFn,
} from 'components/borrow/Table/Columns/Liquidity'
import Manage, { MANAGE_META } from 'components/borrow/Table/Columns/Manage'
import Name, { NAME_META } from 'components/borrow/Table/Columns/Name'

export default function useDepositedColumns() {
  return useMemo<ColumnDef<BorrowMarketTableData>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name data={row.original} />,
      },
      {
        ...DEBT_META,
        cell: ({ row }) => <Debt data={row.original} />,
        sortingFn: debtSortingFn,
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
        cell: ({ row }) => <Manage data={row.original} />,
      },
      {
        ...CHEVRON_META,
        cell: ({ row }) => <Chevron isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [])
}
