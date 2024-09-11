import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Action from '../../../v1/Table/borrowings/Columns/Action'
import BorrowRate, { BORROW_RATE_META } from './BorrowRate'
import Chevron, { CHEVRON_META } from './Chevron'
import DebtValue, { DEBT_VALUE_META, debtSortingFn } from './DebtValue'
import Liquidity, { LIQUIDITY_META, liquiditySortingFn } from './Liquidity'
import Manage, { MANAGE_META } from './Manage'
import Name, { NAME_META } from './Name'

interface Props {
  v1?: boolean
}

export default function useActiveColumns(props: Props) {
  return useMemo<ColumnDef<BorrowMarketTableData>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name data={row.original} v1={props.v1} />,
      },
      {
        ...DEBT_VALUE_META,
        cell: ({ row }) => (
          <DebtValue asset={row.original.asset} debtAmount={row.original.accountDebtAmount} />
        ),
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
        cell: ({ row }) =>
          props.v1 ? <Action data={row.original} /> : <Manage data={row.original} />,
      },
      {
        ...CHEVRON_META,
        cell: ({ row }) => <Chevron isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [props.v1])
}
