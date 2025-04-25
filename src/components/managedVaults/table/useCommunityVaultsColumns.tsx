import { ColumnDef, Row } from '@tanstack/react-table'
import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'
import Fee, { FEE_META } from 'components/managedVaults/table/column/Fee'
import Title, { TITLE_META } from 'components/managedVaults/table/column/Title'
import MyPosition, { MY_POSITION_META } from 'components/managedVaults/table/column/MyPosition'
import TVL, { TVL_META } from 'components/managedVaults/table/column/TVL'
import Details, { DETAILS_META } from 'components/managedVaults/table/column/Details'
import { useMemo } from 'react'
import { convertAprToApy } from 'utils/parsers'

interface Props {
  isLoading: boolean
  showPosition?: boolean
}

export default function useCommunityVaultsColumns(props: Props) {
  const { isLoading, showPosition } = props

  // temporary fix for the incredibly high APY which is not realistic
  const formatAPY = (apy: number) => {
    if (apy > 1000000) {
      return 1000000
    }
    return apy
  }

  return useMemo<ColumnDef<ManagedVaultWithDetails>[]>(() => {
    return [
      {
        ...TITLE_META,
        cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) => (
          <Title value={row.original} isLoading={isLoading} />
        ),
      },
      ...(showPosition
        ? [
            {
              ...MY_POSITION_META,
              cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) => (
                <MyPosition vault={row.original} isLoading={isLoading} />
              ),
            },
          ]
        : []),
      {
        ...TVL_META,
        cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) => (
          <TVL value={row.original} isLoading={isLoading} />
        ),
      },
      {
        ...APY_META,
        accessorKey: 'apr',
        cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) => (
          <Apy
            isLoading={isLoading}
            borrowEnabled={true}
            apy={formatAPY(convertAprToApy(Number(row.original.apr ?? 0), 365))}
          />
        ),
      },
      {
        ...FEE_META,
        cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) => (
          <Fee value={row.original.fee_rate} isLoading={isLoading} />
        ),
      },
      {
        ...DETAILS_META,
        cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) => (
          <Details isLoading={isLoading} vault={row.original} />
        ),
      },
    ]
  }, [isLoading, showPosition])
}
