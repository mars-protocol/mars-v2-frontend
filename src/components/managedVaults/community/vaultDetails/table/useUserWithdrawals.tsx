import { ColumnDef } from '@tanstack/react-table'
import DisplayCurrency from 'components/common/DisplayCurrency'
import UnlockTime, { UNLOCK_TIME_META } from 'components/earn/farm/common/Table/Columns/UnlockTime'
import Timestamp from 'components/managedVaults/community/vaultDetails/table/columns/Timestamp'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import { FormattedNumber } from 'components/common/FormattedNumber'

interface Props {
  isLoading: boolean
  details: ExtendedManagedVaultDetails
  depositAsset: Asset
}

export default function useUserWithdrawals(props: Props) {
  const { isLoading, details, depositAsset } = props

  return useMemo<ColumnDef<UserManagedVaultUnlock>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'Unlock Amount',
        meta: { className: 'min-w-30' },
        cell: ({ row }) => {
          const coin = BNCoin.fromDenomAndBigNumber(
            details.base_tokens_denom,
            BN(row.original.base_tokens_amount),
          )
          return (
            <DisplayCurrency
              coin={coin}
              className='text-xs'
              options={{ abbreviated: false, minDecimals: 2, maxDecimals: 2 }}
            />
          )
        },
      },
      {
        accessorKey: 'Unlock Tokens',
        meta: { className: 'min-w-30' },
        cell: ({ row }) => {
          return (
            <FormattedNumber
              amount={Number(row.original.base_tokens_amount)}
              options={{
                decimals: depositAsset.decimals,
                maxDecimals: 2,
              }}
              className='text-xs'
            />
          )
        },
      },
      {
        header: 'Initiated',
        meta: { className: 'min-w-30' },
        cell: ({ row }) => {
          return <Timestamp value={row.original.created_at} isLoading={isLoading} />
        },
      },
      {
        ...UNLOCK_TIME_META,
        cell: ({ row }) => {
          const unlocksAtMs = row.original.cooldown_end * 1000
          return <UnlockTime unlocksAt={unlocksAtMs} />
        },
      },
    ],
    [isLoading, details.base_tokens_denom, depositAsset.decimals],
  )
}
