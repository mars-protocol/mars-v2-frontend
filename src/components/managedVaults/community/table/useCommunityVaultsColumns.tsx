import { ColumnDef, Row } from '@tanstack/react-table'
import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'
import Fee, { FEE_META } from 'components/managedVaults/common/table/columns/Fee'
import Title, { TITLE_META } from 'components/managedVaults/common/table/columns/Title'
import Details, { DETAILS_META } from 'components/managedVaults/community/table/column/Details'
import MyPosition, {
  MY_POSITION_META,
} from 'components/managedVaults/community/table/column/MyPosition'
import TVL, { TVL_META } from 'components/managedVaults/community/table/column/TVL'
import { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getRoute } from 'utils/route'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import { convertAprToApy } from 'utils/parsers'

interface Props {
  isLoading: boolean
  showPosition?: boolean
}

export default function useCommunityVaultsColumns(props: Props) {
  const { isLoading, showPosition } = props
  const address = useStore((s) => s.address)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const vaultAssets = useVaultAssets()

  const handleVaultDetails = useCallback(
    (vaultAddress: string) => {
      navigate(getRoute(`vaults/${vaultAddress}/details` as Page, searchParams, address))
    },
    [address, navigate, searchParams],
  )

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
        ...DETAILS_META,
        cell: ({ row }: { row: Row<ManagedVaultsData> }) => (
          <Details
            isLoading={isLoading}
            handleVaultDetails={() => handleVaultDetails(row.original.vault_address)}
          />
        ),
      },
    ]
  }, [isLoading, handleVaultDetails, showPosition])
}
