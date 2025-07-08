import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Asset, { ASSET_META } from 'components/Modals/AssetsSelect/Columns/Asset'

export default function useSingleAssetSelectColumns() {
  return useMemo<ColumnDef<AssetTableRow>[]>(() => {
    return [
      {
        ...ASSET_META,
        cell: ({ row }) => <Asset row={row} hideCheckbox={true} />,
      },
    ]
  }, [])
}
