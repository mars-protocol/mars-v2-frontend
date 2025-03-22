import { ColumnDef } from '@tanstack/react-table'
import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'
import TVL, { TVL_META } from 'components/earn/farm/common/Table/Columns/TVL'
import Fee, { FEE_META } from 'components/managedVaults/common/table/columns/Fee'
import FreezePeriod, {
  FREEZE_PERIOD_META,
} from 'components/managedVaults/common/table/columns/FreezePeriod'
import Title, { TITLE_META } from 'components/managedVaults/common/table/columns/Title'
import Details, { DETAILS_META } from 'components/managedVaults/community/table/column/Details'
import { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getRoute } from 'utils/route'
import Name from 'components/earn/lend/Table/Columns/Name'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import { byDenom } from 'utils/array'
import { convertAprToApy } from 'utils/parsers'
import { BN } from 'utils/helpers'

interface Props {
  isLoading: boolean
}

export default function useCommunityVaultsColumns(props: Props) {
  const { isLoading } = props
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
  return useMemo<ColumnDef<ManagedVaultsData>[]>(
    () => [
      {
        ...TITLE_META,
        cell: ({ row }) => (
          <Title value={row.original as ManagedVaultsData} isLoading={isLoading} />
        ),
      },
      {
        header: 'Deposit Asset',
        id: 'symbol',
        meta: { className: 'min-w-30' },
        cell: ({ row }) => {
          const asset = vaultAssets.find(byDenom(row.original.base_tokens_denom))
          return asset && <Name asset={asset} />
        },
      },
      {
        ...TVL_META,
        cell: ({ row }) => (
          <TVL
            amount={BN(row.original.base_tokens_amount)}
            denom={row.original.base_tokens_denom}
          />
        ),
      },
      {
        ...APY_META,
        cell: ({ row }) => (
          <Apy
            isLoading={isLoading}
            borrowEnabled={true}
            apy={convertAprToApy(Number(row.original.apr ?? 0), 365)}
          />
        ),
      },
      {
        ...FEE_META,
        cell: ({ row }) => <Fee value={row.original.fee_rate} isLoading={isLoading} />,
      },
      {
        ...FREEZE_PERIOD_META,
        cell: ({ row }) => (
          <FreezePeriod value={row.original.cooldown_period} isLoading={isLoading} />
        ),
      },
      {
        ...DETAILS_META,
        cell: ({ row }) => (
          <Details
            isLoading={isLoading}
            handleVaultDetails={() => handleVaultDetails(row.original.vault_address)}
          />
        ),
      },
    ],
    [isLoading, handleVaultDetails, vaultAssets],
  )
}
