import React, { useMemo } from 'react'
import TVL, { TVL_META } from 'components/earn/farm/common/Table/Columns/TVL'
import { ColumnDef } from '@tanstack/react-table'
import BigNumber from 'bignumber.js'
import Info, { INFO_META } from 'components/vaults/community/vaultDetails/table/columns/Info'
import Timestamp, {
  TIMESTAMP_META,
} from 'components/vaults/community/vaultDetails/table/columns/Timestamp'
import Shares, { SHARES_META } from './columns/Shares'

interface Props {
  isLoading: boolean
}

export default function useQueuedWithdrawals(props: Props) {
  const { isLoading } = props

  return useMemo<ColumnDef<any>[]>(
    () => [
      {
        ...TIMESTAMP_META,
        cell: ({ row }) => <Timestamp value={row.original} isLoading={isLoading} />,
      },
      {
        ...INFO_META,
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Info value={{ status: row.original.status }} isLoading={isLoading} />,
      },
      {
        header: 'Amount',
        cell: ({ row }) => <TVL amount={BigNumber(row.original.amount)} denom={'usd'} />,
      },
      {
        ...SHARES_META,
        cell: ({ row }) => <Shares value={BigNumber(row.original.shares)} isLoading={isLoading} />,
      },
      {
        ...TVL_META,
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
