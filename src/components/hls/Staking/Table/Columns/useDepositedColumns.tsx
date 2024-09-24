import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Account, { ACCOUNT_META } from 'components/hls/Staking/Table/Columns/Account'
import ActiveApy, {
  ACTIVE_APY_META,
  activeApySortingFn,
} from 'components/hls/Staking/Table/Columns/ActiveApy'
import DepositCap, {
  CAP_META,
  depositCapSortingFn,
} from 'components/hls/Staking/Table/Columns/DepositCap'
import Leverage, {
  LEV_META,
  leverageSortingFn,
} from 'components/hls/Staking/Table/Columns/Leverage'
import Manage, { MANAGE_META } from 'components/hls/Staking/Table/Columns/Manage'
import Name, { NAME_META } from 'components/hls/Staking/Table/Columns/Name'
import NetValue, {
  NET_VAL_META,
  netValueSorting,
} from 'components/hls/Staking/Table/Columns/NetValue'
import PositionValue, {
  POS_VAL_META,
  positionValueSorting,
} from 'components/hls/Staking/Table/Columns/PositionValue'

interface Props {
  isLoading: boolean
}

export default function useDepositedColumns(props: Props) {
  return useMemo<ColumnDef<HlsAccountWithStrategy>[]>(
    () => [
      {
        ...NAME_META,
        cell: ({ row }) => <Name strategy={row.original.strategy} account={row.original} />,
      },
      {
        ...ACCOUNT_META,
        cell: ({ row }) => <Account account={row.original} />,
      },
      {
        ...LEV_META,
        cell: ({ row }) => <Leverage account={row.original} />,
        sortingFn: leverageSortingFn,
      },
      {
        ...POS_VAL_META,
        cell: ({ row }) => <PositionValue account={row.original} />,
        sortingFn: positionValueSorting,
      },
      {
        ...NET_VAL_META,
        cell: ({ row }) => <NetValue account={row.original} />,
        sortingFn: netValueSorting,
      },
      {
        ...CAP_META,
        cell: ({ row }) => <DepositCap depositCap={row.original.strategy.depositCap} />,
        sortingFn: depositCapSortingFn,
      },
      {
        ...ACTIVE_APY_META,
        cell: ({ row }) => <ActiveApy account={row.original} />,
        sortingFn: activeApySortingFn,
      },
      {
        ...MANAGE_META,
        cell: ({ row }) => <Manage account={row.original} />,
      },
    ],
    [],
  )
}
