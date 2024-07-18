import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import DepositCap, { DEPOSIT_CAP_META } from 'components/earn/farm/common/Table/Columns/DepositCap'
import MaxLTV, { LTV_MAX_META } from 'components/earn/farm/common/Table/Columns/MaxLTV'
import Name, { NAME_META } from 'components/earn/farm/common/Table/Columns/Name'
import Apy, { APY_META } from 'components/hls/Farm/Table/Columns/APY'
import Deposit, { DEPOSIT_META } from 'components/hls/Farm/Table/Columns/Deposit'
import MaxLeverage, { MAX_LEV_META } from 'components/hls/Farm/Table/Columns/MaxLeverage'

interface Props {
  isLoading: boolean
}

export default function useAvailableColumns(props: Props) {
  // const
  return useMemo<ColumnDef<Vault>[]>(
    () => [
      {
        ...NAME_META,
        cell: ({ row }) => <Name vault={row.original as Vault} />,
      },
      {
        ...APY_META,
        cell: ({ row }) => <Apy vault={row.original as Vault} />,
      },
      {
        ...MAX_LEV_META,
        cell: ({ row }) => <MaxLeverage vault={row.original} />,
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => <DepositCap vault={row.original as Vault} isLoading={props.isLoading} />,
      },
      {
        ...LTV_MAX_META,
        cell: ({ row }) => <MaxLTV vault={row.original as Vault} />,
      },
      {
        ...DEPOSIT_META,
        cell: ({ row }) => <Deposit vault={row.original as Vault} isLoading={props.isLoading} />,
      },
    ],
    [props.isLoading],
  )
}
