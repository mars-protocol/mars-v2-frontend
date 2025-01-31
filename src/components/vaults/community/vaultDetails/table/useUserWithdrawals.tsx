import DisplayCurrency from 'components/common/DisplayCurrency'
import Timestamp from 'components/vaults/community/vaultDetails/table/columns/Timestamp'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { ColumnDef } from '@tanstack/react-table'
import React, { useMemo } from 'react'
import UnlockTime, { UNLOCK_TIME_META } from 'components/earn/farm/common/Table/Columns/UnlockTime'
import Withdraw, { WITHDRAW_META } from './columns/Withdraw'

interface Props {
  isLoading: boolean
  details: ExtendedManagedVaultDetails
  vaultAddress: string
}

export default function useUserWithdrawals(props: Props) {
  const { isLoading, details, vaultAddress } = props

  return useMemo<ColumnDef<UserManagedVaultUnlock>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'Unlock Amount',
        meta: { className: 'min-w-50' },
        cell: ({ row }) => {
          const coin = BNCoin.fromDenomAndBigNumber(
            details.base_token,
            BN(row.original.vault_tokens),
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
        header: 'Initiated',
        meta: { className: 'min-w-20' },
        cell: ({ row }) => <Timestamp value={row.original.created_at} isLoading={isLoading} />,
      },
      {
        ...UNLOCK_TIME_META,
        cell: ({ row }) => {
          const unlocksAtMs = row.original.cooldown_end * 1000
          return <UnlockTime unlocksAt={unlocksAtMs} />
        },
      },
      {
        ...WITHDRAW_META,
        cell: ({ row }) => {
          return (
            <Withdraw
              amount={row.original.base_tokens}
              vaultAddress={vaultAddress}
              vaultToken={details.vault_token}
              unlocksAt={row.original.cooldown_end * 1000}
            />
          )
        },
      },
    ],
    [isLoading, vaultAddress, details.vault_token, details.base_token],
  )
}
