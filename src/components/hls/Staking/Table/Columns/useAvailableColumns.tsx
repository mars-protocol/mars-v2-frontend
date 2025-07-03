import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import ApyRange, {
  APY_RANGE_META,
  apyRangeSortingFn,
} from 'components/hls/Staking/Table/Columns/ApyRange'
import Deposit, { DEPOSIT_META } from 'components/hls/Staking/Table/Columns/Deposit'
import DepositCap, { CAP_META } from 'components/hls/Staking/Table/Columns/DepositCap'
import MaxLeverage, { MAX_LEV_META } from 'components/hls/Staking/Table/Columns/MaxLeverage'
import MaxLTV, { LTV_MAX_META } from 'components/hls/Staking/Table/Columns/MaxLTV'
import Name, { NAME_META } from 'components/hls/Staking/Table/Columns/Name'

interface Props {
  isLoading: boolean
  openHlsInfoDialog: (continueCallback: () => void) => void
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
          <Deposit
            strategy={row.original as HlsStrategy}
            isLoading={props.isLoading}
            openHlsInfoDialog={props.openHlsInfoDialog}
          />
        ),
      },
    ],
    [props.isLoading, props.openHlsInfoDialog],
  )
}
