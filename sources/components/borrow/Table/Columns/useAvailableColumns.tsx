import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import BorrowButton, { BORROW_BUTTON_META } from './BorrowButton'
import BorrowRate, { BORROW_RATE_META } from './BorrowRate'
import Chevron, { CHEVRON_META } from './Chevron'
import Liquidity, { LIQUIDITY_META, liquiditySortingFn } from './Liquidity'
import Name, { NAME_META } from './Name'

interface Props {
  v1?: boolean
}

export default function useAvailableColumns(props: Props) {
  return useMemo<ColumnDef<BorrowMarketTableData>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name data={row.original} v1={props.v1} />,
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
        ...BORROW_BUTTON_META,
        cell: ({ row }) => <BorrowButton data={row.original} />,
      },
      {
        ...CHEVRON_META,
        cell: ({ row }) => <Chevron isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [props.v1])
}
