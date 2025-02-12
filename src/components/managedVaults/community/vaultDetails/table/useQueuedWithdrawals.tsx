import { ColumnDef } from '@tanstack/react-table'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TVL from 'components/earn/farm/common/Table/Columns/TVL'
import Info, { INFO_META } from 'components/managedVaults/community/vaultDetails/table/columns/Info'
import Timestamp, {
  TIMESTAMP_META,
} from 'components/managedVaults/community/vaultDetails/table/columns/Timestamp'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { useMemo } from 'react'
import { BN } from 'utils/helpers'

interface Props {
  isLoading: boolean
  details: ExtendedManagedVaultDetails
}

export default function useQueuedWithdrawals(props: Props) {
  const { isLoading, details } = props

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
        meta: { className: 'min-w-30' },
        cell: ({ row }) => (
          <FormattedNumber
            amount={Number(row.original.base_tokens)}
            className='text-xs'
            options={{ minDecimals: 0, maxDecimals: 0 }}
          />
        ),
      },
      {
        header: 'Shares',
        meta: { className: 'min-w-20' },
        cell: ({ row }) => (
          <FormattedNumber
            amount={BN(row.original.vault_tokens).shiftedBy(-PRICE_ORACLE_DECIMALS).toNumber()}
            className='text-xs'
            options={{ minDecimals: 0, maxDecimals: 0 }}
          />
        ),
      },
      {
        header: 'Total Position',
        meta: { className: 'min-w-30' },
        cell: ({ row }) => {
          return <TVL amount={BN(row.original.vault_tokens)} denom={details.base_token} />
        },
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
    [isLoading, details.base_token],
  )
}
