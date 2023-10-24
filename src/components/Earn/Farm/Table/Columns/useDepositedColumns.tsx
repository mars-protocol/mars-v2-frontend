import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/Earn/Farm/Table/Columns/Apy'
import DepositCap, {
  DEPOSIT_CAP_META,
  depositCapSortingFn,
} from 'components/Earn/Farm/Table/Columns/DepositCap'
import Details, { DETAILS_META } from 'components/Earn/Farm/Table/Columns/Details'
import MaxLTV, { LTV_MAX_META } from 'components/Earn/Farm/Table/Columns/MaxLTV'
import Name, { NAME_META } from 'components/Earn/Farm/Table/Columns/Name'
import PositionValue, {
  POSITION_VALUE_META,
} from 'components/Earn/Farm/Table/Columns/PositionValue'
import TVL, { TVL_META } from 'components/Earn/Farm/Table/Columns/TVL'

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
        ...DETAILS_META,
        cell: ({ row }) => <Details isLoading={props.isLoading} isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [props.isLoading])
}
