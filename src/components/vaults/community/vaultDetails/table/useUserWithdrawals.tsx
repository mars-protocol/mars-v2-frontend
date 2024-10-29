import BigNumber from 'bignumber.js'
import Button from 'components/common/Button'
import TVL from 'components/earn/farm/common/Table/Columns/TVL'
import Timestamp from 'components/vaults/community/vaultDetails/table/columns/Timestamp'
import React, { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import UnlockTime, { UNLOCK_TIME_META } from 'components/earn/farm/common/Table/Columns/UnlockTime'
import {
  VaultWithdraw,
  WITHDRAW_META,
} from 'components/earn/farm/vault/Table/Columns/VaultWithdraw'
import { AccountArrowDown } from 'components/common/Icons'
import UnlockAmount, {
  UNLOCK_AMOUNT_META,
} from 'components/earn/farm/common/Table/Columns/UnlockAmount'

interface Props {
  isLoading: boolean
}

export default function useUserWithdrawals(props: Props) {
  const { isLoading } = props

  // TODO: update once we know data structure
  return useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'Unlock Amount',
        meta: { className: 'min-w-50' },
        // TODO: use <UnlockAmount> depedning on the data
        // cell: ({ row }) => <UnlockAmount vault={} />,
        cell: ({ row }) => <TVL amount={BigNumber(row.original.amount)} denom={'usd'} />,
      },
      {
        header: 'Initiated',
        meta: { className: 'min-w-20' },
        cell: ({ row }) => <Timestamp value={row.original} isLoading={isLoading} />,
      },
      {
        ...UNLOCK_TIME_META,
        cell: ({ row }) => <UnlockTime unlocksAt={row.original.unlocksAt} />,
      },
      {
        ...WITHDRAW_META,
        // cell: ({ row }: { row: any }) => <VaultWithdraw vault={} />,
        // temporary showing this button:
        cell: ({ row }: { row: any }) => (
          <Button
            onClick={() => {}}
            color='tertiary'
            leftIcon={<AccountArrowDown />}
            className='ml-auto'
          >
            Withdraw
          </Button>
        ),
      },
    ],
    [isLoading],
  )
}
