import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'
import Chevron, { CHEVRON_META } from 'components/earn/lend/Table/Columns/Chevron'
import DepositValue, {
  DEPOSIT_VALUE_META,
  depositedSortingFn,
} from 'components/earn/lend/Table/Columns/DepositValue'
import Manage, { MANAGE_META } from 'components/earn/lend/Table/Columns/Manage'
import Name, { NAME_META } from 'components/earn/lend/Table/Columns/Name'
import Action from 'components/v1/Table/deposits/Columns/Action'

interface Props {
  isLoading: boolean
  v1?: boolean
}

export default function useDepositedColumns(props: Props) {
  return useMemo<ColumnDef<LendingMarketTableData>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => (
          <Name asset={row.original.asset} v1={props.v1} amount={row.original.accountLentAmount} />
        ),
      },

      {
        ...APY_META,
        cell: ({ row }) => (
          <Apy
            isLoading={props.isLoading}
            borrowEnabled={row.original.borrowEnabled}
            apy={row.original.apy.deposit}
            campaigns={row.original.asset.campaigns}
          />
        ),
        sortingFn: (rowA, rowB) => {
          const getTotalApy = (row: typeof rowA) => {
            const depositApy = row.original.apy.deposit
            const campaignApy = row.original.asset.campaigns
              .filter((c: AssetCampaign) => c.type === 'apy' && c.apy)
              .reduce((sum: number, c: AssetCampaign) => sum + (c.apy || 0), 0)
            return depositApy + campaignApy
          }
          return getTotalApy(rowA) - getTotalApy(rowB)
        },
      },
      {
        ...DEPOSIT_VALUE_META,
        cell: ({ row }) => (
          <DepositValue asset={row.original.asset} lentAmount={row.original.accountLentAmount} />
        ),
        sortingFn: depositedSortingFn,
      },
      {
        ...MANAGE_META,
        cell: ({ row }) =>
          props.v1 ? <Action data={row.original} /> : <Manage data={row.original} />,
      },
      {
        ...CHEVRON_META,
        cell: ({ row }) => <Chevron isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [props.isLoading, props.v1])
}
