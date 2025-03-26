import { ColumnDef } from '@tanstack/react-table'
import BigNumber from 'bignumber.js'
import TVL, { TVL_META } from 'components/earn/farm/common/Table/Columns/TVL'
import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'
import Fee, { FEE_META } from 'components/managedVaults/common/table/columns/Fee'
import FreezePeriod, {
  FREEZE_PERIOD_META,
} from 'components/managedVaults/common/table/columns/FreezePeriod'
import Title, { TITLE_META } from 'components/managedVaults/common/table/columns/Title'
import Deposit, { DEPOSIT_META } from 'components/managedVaults/official/table/column/Deposit'
import { useMemo } from 'react'
import { convertAprToApy } from 'utils/parsers'

interface Props {
  isLoading: boolean
}

export default function useOfficialVaultsColumns(props: Props) {
  const { isLoading } = props

  return useMemo<ColumnDef<ManagedVaultsData>[]>(
    () => [
      {
        ...TITLE_META,
        cell: ({ row }) => (
          <Title value={row.original as ManagedVaultsData} isLoading={isLoading} />
        ),
      },
      {
        ...TVL_META,
        cell: ({ row }) => <TVL amount={BigNumber(row.original.tvl)} denom={'usd'} />,
      },
      {
        ...APY_META,
        cell: ({ row }) => (
          <Apy
            isLoading={isLoading}
            borrowEnabled={true}
            apy={convertAprToApy(Number(row.original.apr ?? 0), 365)}
          />
        ),
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
