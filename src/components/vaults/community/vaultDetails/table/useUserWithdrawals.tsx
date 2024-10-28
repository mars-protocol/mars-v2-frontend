import BigNumber from 'bignumber.js'
import TVL from 'components/earn/farm/common/Table/Columns/TVL'
import Info, { INFO_META } from 'components/vaults/community/vaultDetails/table/columns/Info'
import Timestamp, {
  TIMESTAMP_META,
} from 'components/vaults/community/vaultDetails/table/columns/Timestamp'
import Shares, { SHARES_META } from 'components/vaults/community/vaultDetails/table/columns/Shares'
import React, { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'

interface Props {
  isLoading: boolean
}

export default function useUserWithdrawals(props: Props) {
  const { isLoading } = props

  // TODO: update once we know data structure
  return useMemo<ColumnDef<any>[]>(
    () => [
      // {
      //   ...INFO_META,
      //   accessorKey: 'status',
      //   header: 'Status',
      //   cell: ({ row }) => <Info value={{ status: row.original.status }} isLoading={isLoading} />,
      // },
      {
        header: 'Amount',
        id: 'name',
        accessorKey: 'amount',
        meta: { className: 'min-w-50' },
        cell: ({ row }) => <TVL amount={BigNumber(row.original.amount)} denom={'usd'} />,
      },
      {
        header: 'Initiated',
        cell: ({ row }) => <Timestamp value={row.original} isLoading={isLoading} />,
      },
      // {
      //   ...SHARES_META,
      //   cell: ({ row }) => <Shares value={BigNumber(row.original.shares)} isLoading={isLoading} />,
      // },
      {
        header: 'Total Position',
        meta: { className: 'w-30' },
        cell: ({ row }) => <TVL amount={BigNumber(row.original.totalPosition)} denom={'usd'} />,
      },
      {
        ...INFO_META,
        accessorKey: 'address',
        header: 'Wallet Address',
        cell: ({ row }) => (
          <Info value={{ walletAddress: row.original.walletAddress }} isLoading={isLoading} />
        ),
      },
    ],
    [isLoading],
  )
}
