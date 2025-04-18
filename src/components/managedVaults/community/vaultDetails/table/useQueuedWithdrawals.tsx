import { ColumnDef } from '@tanstack/react-table'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TVL from 'components/earn/farm/common/Table/Columns/TVL'
import Info, { INFO_META } from 'components/managedVaults/community/vaultDetails/table/columns/Info'
import Timestamp, {
  TIMESTAMP_META,
} from 'components/managedVaults/community/vaultDetails/table/columns/Timestamp'
import { useMemo } from 'react'
import { BN } from 'utils/helpers'

interface Props {
  isLoading: boolean
  details: ManagedVaultsData
  depositAsset: Asset
}

export default function useQueuedWithdrawals(props: Props) {
  const { isLoading, details, depositAsset } = props

  return useMemo<ColumnDef<UserManagedVaultUnlock>[]>(
    () => [
      {
        ...TIMESTAMP_META,
        cell: ({ row }) => <Timestamp value={row.original.created_at} isLoading={isLoading} />,
      },
      {
        ...INFO_META,
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Info value={{ cooldown_end: row.original.cooldown_end }} isLoading={isLoading} />
        ),
      },
      {
        header: 'Amount',
        meta: { className: 'min-w-20' },
        cell: ({ row }) => (
          <FormattedNumber
            amount={Number(row.original.base_tokens_amount)}
            options={{
              decimals: depositAsset.decimals,
              maxDecimals: 2,
            }}
            className='text-xs'
          />
        ),
      },
      {
        header: 'Shares',
        meta: { className: 'min-w-20' },
        cell: ({ row }) => (
          <FormattedNumber
            amount={Number(row.original.vault_tokens_amount)}
            className='text-xs'
            options={{
              decimals: depositAsset.decimals,
              maxDecimals: 2,
              abbreviated: true,
            }}
          />
        ),
      },
      {
        header: 'Total Position',
        meta: { className: 'min-w-30' },
        cell: ({ row }) => (
          <TVL amount={BN(row.original.base_tokens_amount)} denom={details.base_tokens_denom} />
        ),
      },
      {
        ...INFO_META,
        accessorKey: 'address',
        header: 'Wallet Address',
        cell: ({ row }) => (
          <Info value={{ walletAddress: row.original.user_address }} isLoading={isLoading} />
        ),
      },
    ],
    [isLoading, details.base_tokens_denom, depositAsset.decimals],
  )
}
