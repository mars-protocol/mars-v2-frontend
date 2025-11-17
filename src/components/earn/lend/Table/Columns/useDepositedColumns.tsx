import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'
import Chevron, { CHEVRON_META } from 'components/earn/lend/Table/Columns/Chevron'
import DepositCap, {
  DEPOSIT_CAP_META,
  marketDepositCapSortingFn,
} from 'components/earn/lend/Table/Columns/DepositCap'
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
    const adjustedNameMeta = props.v1
      ? { ...NAME_META, meta: { className: 'min-w-37' } }
      : NAME_META

    return [
      {
        ...adjustedNameMeta,
        cell: ({ row }) => (
          <Name asset={row.original.asset} v1={props.v1} amount={row.original.accountLentAmount} />
        ),
      },
      {
        ...DEPOSIT_VALUE_META,
        cell: ({ row }) => (
          <DepositValue asset={row.original.asset} lentAmount={row.original.accountLentAmount} />
        ),
        sortingFn: depositedSortingFn,
      },
      {
        ...APY_META,
        cell: ({ row }) => (
          <Apy
            isLoading={props.isLoading}
            borrowEnabled={row.original.borrowEnabled}
            apy={row.original.apy.deposit}
            hasCampaignApy={
              row.original.asset.campaigns.find((c) => c.type === 'apy') !== undefined
            }
          />
        ),
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => <DepositCap isLoading={props.isLoading} data={row.original} />,
        sortingFn: marketDepositCapSortingFn,
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
