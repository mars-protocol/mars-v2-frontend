import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Asset, { ASSET_META } from './Asset'
import Balance, { BALANCE_META, valueSortingFn } from './Balance'
import BorrowRate, { BORROW_RATE_META } from './BorrowRate'

export default function useAssetSelectColumns(isBorrow?: boolean) {
  return useMemo<ColumnDef<AssetTableRow>[]>(() => {
    return [
      {
        ...ASSET_META,
        cell: ({ row }) => <Asset row={row} />,
      },
      isBorrow
        ? {
            ...BORROW_RATE_META,
            cell: ({ row }) => <BorrowRate row={row} />,
          }
        : {
            ...BALANCE_META,
            cell: ({ row }) => <Balance row={row} />,
            sortingFn: valueSortingFn,
          },
    ]
  }, [isBorrow])
}
