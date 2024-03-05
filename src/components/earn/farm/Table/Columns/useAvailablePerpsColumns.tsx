import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import { Deposit, DEPOSIT_META } from 'components/earn/farm/Table/Columns/Deposit'
import DepositCap, {
  DEPOSIT_CAP_META,
  depositCapSortingFn,
} from 'components/earn/farm/Table/Columns/DepositCap'
import { NAME_META } from 'components/earn/farm/Table/Columns/Name'
import { PerpsName } from 'components/earn/farm/Table/Columns/PerpsName'

interface Props {
  isLoading: boolean
}

export default function useAvailableColumns(props: Props) {
  return useMemo<ColumnDef<PerpsVault>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <PerpsName vault={row.original as PerpsVault} />,
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => (
          <DepositCap vault={row.original as PerpsVault} isLoading={props.isLoading} />
        ),
        sortingFn: depositCapSortingFn,
      },
      {
        ...DEPOSIT_META,
        cell: ({ row }) => (
          <Deposit vault={row.original as PerpsVault} isLoading={props.isLoading} isPerps />
        ),
      },
    ]
  }, [props.isLoading])
}
