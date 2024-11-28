import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import Asset from 'components/perps/VaultSection/Columns/Asset'
import Value from 'components/perps/VaultSection/Columns/Value'
import Status from 'components/perps/VaultSection/Columns/Status'

export default function usePerpsVaultColumns() {
  return useMemo<ColumnDef<PerpsVaultRow>[]>(() => {
    return [
      {
        header: 'Asset',
        accessorKey: 'name',
        cell: ({ row }) => <Asset row={row.original} />,
      },
      {
        header: 'Value',
        cell: ({ row }) => <Value row={row.original} />,
      },
      {
        header: 'Status',
        cell: ({ row }) => <Status row={row.original} />,
      },
    ]
  }, [])
}
