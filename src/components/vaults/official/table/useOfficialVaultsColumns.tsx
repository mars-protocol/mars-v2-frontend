import { ColumnDef } from '@tanstack/react-table'
import React, { useMemo } from 'react'
import Name, { NAME_META } from 'components/vaults/common/table/columns/Name'
import Fee, { FEE_META } from 'components/vaults/common/table/columns/Fee'
import FreezePeriod, {
  FREEZE_PERIOD_META,
} from 'components/vaults/common/table/columns/FreezePeriod'
import Deposit, { DEPOSIT_META } from 'components/vaults/official/table/column/Deposit'
import Apy, { APY_META } from 'components/earn/farm/vault/Table/Columns/VaultApy'
import TVL, { TVL_META } from 'components/earn/farm/common/Table/Columns/TVL'
import BigNumber from 'bignumber.js'

interface Props {
  isLoading: boolean
}

export default function useOfficialVaultsColumns(props: Props) {
  const { isLoading } = props

  return useMemo<ColumnDef<Vaults>[]>(
    () => [
      {
        ...NAME_META,
        cell: ({ row }) => <Name value={row.original as Vaults} isLoading={isLoading} />,
      },
      {
        ...TVL_META,
        cell: ({ row }) => <TVL amount={BigNumber(1000)} denom={'usd'} />,
      },
      {
        ...APY_META,
        cell: ({ row }) => <Apy vault={row.original.apy} />,
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
