import { ColumnDef, Row } from '@tanstack/react-table'
import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'
import Fee, { FEE_META } from 'components/managedVaults/common/table/columns/Fee'
import Title, { TITLE_META } from 'components/managedVaults/common/table/columns/Title'
import MyPosition, {
  MY_POSITION_META,
} from 'components/managedVaults/community/table/column/MyPosition'
import TVL, { TVL_META } from 'components/managedVaults/community/table/column/TVL'
import Manage, { MANAGE_META } from 'components/managedVaults/community/table/column/Manage'
import { useMemo } from 'react'
import { convertAprToApy } from 'utils/parsers'

interface Props {
  isLoading: boolean
  showPosition?: boolean
}

export default function useCommunityVaultsColumns(props: Props) {
  const { isLoading, showPosition } = props

  return useMemo<ColumnDef<ManagedVaultsData>[]>(() => {
    return [
      {
        ...TITLE_META,
        cell: ({ row }: { row: Row<ManagedVaultsData> }) => (
          <Title value={row.original} isLoading={isLoading} />
        ),
      },
      ...(showPosition
        ? [
            {
              ...MY_POSITION_META,
              cell: ({ row }: { row: Row<ManagedVaultsData> }) => (
                <MyPosition vault={row.original} isLoading={isLoading} />
              ),
            },
          ]
        : []),
      {
        ...TVL_META,
        cell: ({ row }: { row: Row<ManagedVaultsData> }) => (
          <TVL value={row.original} isLoading={isLoading} />
        ),
      },
      {
        ...APY_META,
        accessorKey: 'apr',
        cell: ({ row }: { row: Row<ManagedVaultsData> }) => (
          <Apy
            isLoading={isLoading}
            borrowEnabled={true}
            apy={convertAprToApy(Number(row.original.apr ?? 0), 365)}
          />
        ),
      },
      {
        ...FEE_META,
        cell: ({ row }: { row: Row<ManagedVaultsData> }) => (
          <Fee value={row.original.fee_rate} isLoading={isLoading} />
        ),
      },
      {
        ...MANAGE_META,
        cell: ({ row }: { row: Row<ManagedVaultsData> }) => (
          <Manage isLoading={isLoading} vault={row.original} />
        ),
      },
    ]
  }, [isLoading, showPosition])
}
