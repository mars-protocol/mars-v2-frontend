import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import Action from '../../../../v1/Table/deposits/Columns/Action'
import Apy, { APY_META } from './Apy'
import Campaign, { CAMPAIGN_META } from './Campaign'
import Chevron, { CHEVRON_META } from './Chevron'
import DepositCap, { DEPOSIT_CAP_META, marketDepositCapSortingFn } from './DepositCap'
import DepositValue, { DEPOSIT_VALUE_META, depositedSortingFn } from './DepositValue'
import Manage, { MANAGE_META } from './Manage'
import Name, { NAME_META } from './Name'

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
      ...(!props.v1
        ? [
            {
              ...CAMPAIGN_META,
              cell: ({ row }: { row: Row<LendingMarketTableData> }) => (
                <Campaign asset={row.original.asset} amount={row.original.accountLentAmount} />
              ),
            },
          ]
        : []),
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
