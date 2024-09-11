import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import VaultApy, { APY_META } from '../../../vault/Table/Columns/VaultApy'
import { Deposit, DEPOSIT_META } from './Deposit'
import DepositCap, { DEPOSIT_CAP_META, depositCapSortingFn } from './DepositCap'
import MaxLTV, { LTV_MAX_META } from './MaxLTV'
import Name, { NAME_META } from './Name'
import TVL, { TVL_META } from './TVL'

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
        cell: ({ row }) => <VaultApy vault={row.original as Vault} />,
      },
      {
        ...TVL_META,
        cell: ({ row }) => (
          <TVL
            denom={(row.original as Vault).cap?.denom}
            amount={(row.original as Vault).cap?.used}
          />
        ),
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => <DepositCap vault={row.original as Vault} isLoading={props.isLoading} />,
        sortingFn: depositCapSortingFn,
      },
      {
        ...LTV_MAX_META,
        cell: ({ row }) => <MaxLTV vault={row.original as Vault} />,
      },
      {
        ...DEPOSIT_META,
        cell: ({ row }) => <Deposit vault={row.original as Vault} isLoading={props.isLoading} />,
      },
    ]
  }, [props.isLoading])
}
