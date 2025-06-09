import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Asset, { ASSET_META } from 'components/Modals/AssetsSelect/Columns/Asset'
import Balance, {
  BALANCE_META,
  valueSortingFn,
} from 'components/Modals/AssetsSelect/Columns/Balance'
import BorrowRate, { BORROW_RATE_META } from 'components/Modals/AssetsSelect/Columns/BorrowRate'

export default function useAssetSelectColumns(isBorrow?: boolean, hideApy?: boolean) {
  return useMemo<ColumnDef<AssetTableRow>[]>(() => {
    return [
      {
        ...ASSET_META,
        cell: ({ row }) => <Asset row={row} hideApy={hideApy} />,
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
  }, [isBorrow, hideApy])
}
