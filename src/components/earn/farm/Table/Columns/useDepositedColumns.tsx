import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/earn/farm/Table/Columns/Apy'
import DepositCap, {
  DEPOSIT_CAP_META,
  depositCapSortingFn,
} from 'components/earn/farm/Table/Columns/DepositCap'
import Manage, { MANAGE_META } from 'components/earn/farm/Table/Columns/Manage'
import MaxLTV, { LTV_MAX_META } from 'components/earn/farm/Table/Columns/MaxLTV'
import Name, { NAME_META } from 'components/earn/farm/Table/Columns/Name'
import PositionValue, {
  POSITION_VALUE_META,
} from 'components/earn/farm/Table/Columns/PositionValue'
import TVL, { TVL_META } from 'components/earn/farm/Table/Columns/TVL'

interface Props {
  isLoading: boolean
}

export default function useDepositedColumns(props: Props) {
  return useMemo<ColumnDef<DepositedVault>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name vault={row.original as DepositedVault} />,
      },
      {
        ...POSITION_VALUE_META,
        cell: ({ row }: { row: Row<DepositedVault> }) => (
          <PositionValue vault={row.original as DepositedVault} isLoading={props.isLoading} />
        ),
      },
      {
        ...APY_META,
        cell: ({ row }) => <Apy vault={row.original as DepositedVault} />,
      },
      {
        ...TVL_META,
        cell: ({ row }) => (
          <TVL vault={row.original as DepositedVault} isLoading={props.isLoading} />
        ),
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => (
          <DepositCap vault={row.original as DepositedVault} isLoading={props.isLoading} />
        ),
        sortingFn: depositCapSortingFn,
      },
      {
        ...LTV_MAX_META,
        cell: ({ row }) => (
          <MaxLTV vault={row.original as DepositedVault} isLoading={props.isLoading} />
        ),
      },
      {
        ...MANAGE_META,
        cell: ({ row }) => (
          <Manage
            vault={row.original}
            isLoading={props.isLoading}
            isExpanded={row.getIsExpanded()}
          />
        ),
      },
    ]
  }, [props.isLoading])
}
