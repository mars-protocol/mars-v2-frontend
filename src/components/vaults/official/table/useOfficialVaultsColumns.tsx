import React, { useMemo } from 'react'
import Apr, { APR_META } from 'components/vaults/common/table/columns/Apr'
import Name, { NAME_META } from 'components/vaults/common/table/columns/Name'
import Fee, { FEE_META } from 'components/vaults/common/table/columns/Fee'
import Deposit, { DEPOSIT_META } from 'components/vaults/official/table/column/Deposit'
import FreezePeriod, {
  FREEZE_PERIOD_META,
} from 'components/vaults/common/table/columns/FreezePeriod'
import TVL, { TVL_META } from 'components/earn/farm/common/Table/Columns/TVL'
import { ColumnDef } from '@tanstack/react-table'
import BigNumber from 'bignumber.js'

interface Props {
  isLoading: boolean
}

export default function useOfficialVaultsColumns(props: Props) {
  const { isLoading } = props

  return useMemo<ColumnDef<VaultData>[]>(
    () => [
      {
        ...NAME_META,
        cell: ({ row }) => <Name value={row.original as VaultData} isLoading={isLoading} />,
      },
      {
        ...TVL_META,
        cell: ({ row }) => <TVL amount={BigNumber(row.original.tvl)} denom={'usd'} />,
      },
      {
        ...APR_META,
        cell: ({ row }) => <Apr value={row.original.apr} isLoading={isLoading} />,
      },
      {
        ...FEE_META,
        cell: ({ row }) => <Fee value={row.original.fee} isLoading={isLoading} />,
      },
      {
        ...FREEZE_PERIOD_META,
        cell: ({ row }) => <FreezePeriod value={row.original.freezePeriod} isLoading={isLoading} />,
      },
      {
        ...DEPOSIT_META,
        cell: () => <Deposit isLoading={isLoading} />,
      },
    ],
    [isLoading],
  )
}
