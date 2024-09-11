import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import ApyRange, { APY_RANGE_META, apyRangeSortingFn } from './ApyRange'
import Deposit, { DEPOSIT_META } from './Deposit'
import DepositCap, { CAP_META } from './DepositCap'
import MaxLeverage, { MAX_LEV_META } from './MaxLeverage'
import MaxLTV, { LTV_MAX_META } from './MaxLTV'
import Name, { NAME_META } from './Name'

interface Props {
  isLoading: boolean
}

export default function useAvailableColumns(props: Props) {
  return useMemo<ColumnDef<HlsStrategy>[]>(
    () => [
      {
        ...NAME_META,
        cell: ({ row }) => <Name strategy={row.original} />,
      },
      {
        ...MAX_LEV_META,
        cell: ({ row }) => <MaxLeverage strategy={row.original} />,
      },
      {
        ...LTV_MAX_META,
        cell: ({ row }) => (
          <MaxLTV strategy={row.original as HlsStrategy} isLoading={props.isLoading} />
        ),
      },
      {
        ...CAP_META,
        cell: ({ row }) => <DepositCap depositCap={row.original.depositCap} />,
      },
      {
        ...APY_RANGE_META,
        cell: ({ row }) => (
          <ApyRange strategy={row.original as HlsStrategy} isLoading={props.isLoading} />
        ),
        sortingFn: apyRangeSortingFn,
      },
      {
        ...DEPOSIT_META,
        cell: ({ row }) => (
          <Deposit strategy={row.original as HlsStrategy} isLoading={props.isLoading} />
        ),
      },
    ],
    [props.isLoading],
  )
}
