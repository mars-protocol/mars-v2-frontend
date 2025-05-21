import { ColumnDef, Row } from '@tanstack/react-table'
import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'
import Fee, { FEE_META } from 'components/managedVaults/table/column/Fee'
import Title, { TITLE_META } from 'components/managedVaults/table/column/Title'
import MyPosition, { MY_POSITION_META } from 'components/managedVaults/table/column/MyPosition'
import TVL, { TVL_META } from 'components/managedVaults/table/column/TVL'
import Details, { DETAILS_META } from 'components/managedVaults/table/column/Details'
import { useMemo } from 'react'
import { convertAprToApy } from 'utils/parsers'
import Button from 'components/common/Button'
import useStore from 'store'

interface Props {
  isLoading: boolean
  showPosition?: boolean
  pendingVault?: {
    address: string
    amount: string
    status: string
  } | null
}

export default function useCommunityVaultsColumns(props: Props) {
  const { isLoading, showPosition, pendingVault } = props
  const mintVaultAccount = useStore((s) => s.createAccount)
  const depositInManagedVault = useStore((s) => s.depositInManagedVault)

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
            apy={convertAprToApy(Number(row.original.apr ?? 0), 365)}
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
        cell: ({ row }: { row: Row<ManagedVaultWithDetails> }) =>
          row.original.isPending ? (
            <div className='flex items-center justify-end'>
              <Button onClick={() => {}} text='Continue Setup' />
            </div>
          ) : (
            <Details isLoading={isLoading} vault={row.original} />
          ),
      },
    ]
  }, [isLoading, showPosition])
}
