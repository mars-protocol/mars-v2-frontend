import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/Earn/Farm/Table/Columns/Apy'
import { Deposit } from 'components/Earn/Farm/Table/Columns/Deposit'
import DepositCap, {
  DEPOSIT_CAP_META,
  depositCapSortingFn,
} from 'components/Earn/Farm/Table/Columns/DepositCap'
import MaxLTV, { LTV_MAX_META } from 'components/Earn/Farm/Table/Columns/MaxLTV'
import Name, { NAME_META } from 'components/Earn/Farm/Table/Columns/Name'
import TVL, { TVL_META } from 'components/Earn/Farm/Table/Columns/TVL'
import { DETAILS_META } from 'components/Earn/Farm/Table/Columns/Details'

interface Props {
  isLoading: boolean
}

export default function useAvailableColumns(props: Props) {
  return useMemo<ColumnDef<Vault | DepositedVault>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name vault={row.original as Vault} />,
      },
      {
        ...APY_META,
        cell: ({ row }) => <Apy vault={row.original as Vault} />,
      },
      {
        ...TVL_META,
        cell: ({ row }) => <TVL vault={row.original as Vault} isLoading={props.isLoading} />,
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => <DepositCap vault={row.original as Vault} isLoading={props.isLoading} />,
        sortingFn: depositCapSortingFn,
      },
      {
        ...LTV_MAX_META,
        cell: ({ row }) => <MaxLTV vault={row.original as Vault} isLoading={props.isLoading} />,
      },
      {
        ...DETAILS_META,
        cell: ({ row }) => <Deposit vault={row.original as Vault} isLoading={props.isLoading} />,
      },
    ]
  }, [props.isLoading])
}
