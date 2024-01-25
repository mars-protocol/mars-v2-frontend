import { ColumnDef } from '@tanstack/react-table'
import React, { useMemo } from 'react'

import Deposit, { DEPOSIT_META } from 'components/hls/Farm/Table/Columns/Deposit'
import ApyRange, {
  APY_RANGE_META,
  apyRangeSortingFn,
} from 'components/hls/Staking/Table/Columns/ApyRange'
import DepositCap, { CAP_META } from 'components/hls/Staking/Table/Columns/DepositCap'
import MaxLeverage, { MAX_LEV_META } from 'components/hls/Staking/Table/Columns/MaxLeverage'
import MaxLTV, { LTV_MAX_META } from 'components/hls/Staking/Table/Columns/MaxLTV'
import Name, { NAME_META } from 'components/hls/Staking/Table/Columns/Name'

interface Props {
  isLoading: boolean
}

export default function useAvailableColumns(props: Props) {
  return useMemo<ColumnDef<HLSStrategy>[]>(
    () => [
      {
        ...NAME_META,
        cell: ({ row }) => <Name strategy={row.original as HLSStrategy} />,
      },
      {
        ...MAX_LEV_META,
        cell: ({ row }) => <MaxLeverage strategy={row.original} />,
      },
      {
        ...LTV_MAX_META,
        cell: ({ row }) => (
          <MaxLTV strategy={row.original as HLSStrategy} isLoading={props.isLoading} />
        ),
      },
      {
        ...CAP_META,
        cell: ({ row }) => <DepositCap depositCap={row.original.depositCap} />,
      },
      {
        ...APY_RANGE_META,
        cell: ({ row }) => (
          <ApyRange strategy={row.original as HLSStrategy} isLoading={props.isLoading} />
        ),
        sortingFn: apyRangeSortingFn,
      },
      {
        ...DEPOSIT_META,
        cell: ({ row }) => (
          <Deposit strategy={row.original as HLSStrategy} isLoading={props.isLoading} />
        ),
      },
    ],
    [props.isLoading],
  )
}
