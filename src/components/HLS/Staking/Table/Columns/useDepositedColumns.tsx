import { ColumnDef } from '@tanstack/react-table'
import React, { useMemo } from 'react'

import Account, { ACCOUNT_META } from 'components/HLS/Staking/Table/Columns/Account'
import ActiveApy, {
  ACTIVE_APY_META,
  activeApySortingFn,
} from 'components/HLS/Staking/Table/Columns/ActiveApy'
import DebtValue, {
  DEBT_VAL_META,
  debtValueSorting,
} from 'components/HLS/Staking/Table/Columns/DebtValue'
import DepositCap, {
  CAP_META,
  depositCapSortingFn,
} from 'components/HLS/Staking/Table/Columns/DepositCap'
import Leverage, {
  LEV_META,
  leverageSortingFn,
} from 'components/HLS/Staking/Table/Columns/Leverage'
import Manage, { MANAGE_META } from 'components/HLS/Staking/Table/Columns/Manage'
import Name, { NAME_META } from 'components/HLS/Staking/Table/Columns/Name'
import NetValue, {
  NET_VAL_META,
  netValueSorting,
} from 'components/HLS/Staking/Table/Columns/NetValue'
import PositionValue, {
  POS_VAL_META,
  positionValueSorting,
} from 'components/HLS/Staking/Table/Columns/PositionValue'

interface Props {
  isLoading: boolean
}

export default function useDepositedColumns(props: Props) {
  return useMemo<ColumnDef<HLSAccountWithStrategy>[]>(
    () => [
      {
        ...NAME_META,
        cell: ({ row }) => <Name strategy={row.original.strategy} />,
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
        ...DEBT_VAL_META,
        cell: ({ row }) => <DebtValue account={row.original} />,
        sortingFn: debtValueSorting,
      },
      {
        ...CAP_META,
        cell: ({ row }) => <DepositCap account={row.original} />,
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
