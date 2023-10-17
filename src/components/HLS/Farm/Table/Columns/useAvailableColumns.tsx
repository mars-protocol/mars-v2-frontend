import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Name from 'components/HLS/Farm/Table/Columns/Name'

export default function useAvailableColumns() {
  return useMemo<ColumnDef<HLSStrategy>[]>(
    () => [
      {
        header: 'Vault',
        accessorKey: 'name',
        cell: ({ row }) => <Name strategy={row.original} />,
      },
    ],
    [],
  )
}
