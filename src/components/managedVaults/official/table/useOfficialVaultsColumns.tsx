import { ColumnDef } from '@tanstack/react-table'
import BigNumber from 'bignumber.js'
import TVL, { TVL_META } from 'components/earn/farm/common/Table/Columns/TVL'
import Apr, { APR_META } from 'components/managedVaults/common/table/columns/Apr'
import Fee, { FEE_META } from 'components/managedVaults/common/table/columns/Fee'
import FreezePeriod, {
  FREEZE_PERIOD_META,
} from 'components/managedVaults/common/table/columns/FreezePeriod'
import Name, { NAME_META } from 'components/managedVaults/common/table/columns/Name'
import Deposit, { DEPOSIT_META } from 'components/managedVaults/official/table/column/Deposit'
import { useMemo } from 'react'

interface Props {
  isLoading: boolean
}

export default function useOfficialVaultsColumns(props: Props) {
  const { isLoading } = props

  return useMemo<ColumnDef<ManagedVaultsData>[]>(
    () => [
      {
        ...NAME_META,
        cell: ({ row }) => <Name value={row.original as ManagedVaultsData} isLoading={isLoading} />,
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
        cell: ({ row }) => <Fee value={row.original.fee_rate} isLoading={isLoading} />,
      },
      {
        ...FREEZE_PERIOD_META,
        cell: ({ row }) => (
          <FreezePeriod value={row.original.cooldown_period} isLoading={isLoading} />
        ),
      },
      {
        ...DEPOSIT_META,
        cell: () => <Deposit isLoading={isLoading} />,
      },
    ],
    [isLoading],
  )
}
