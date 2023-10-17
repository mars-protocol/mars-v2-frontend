import { ColumnDef } from '@tanstack/react-table'
import React, { useMemo } from 'react'

import Apy from 'components/Earn/Farm/Table/Columns/Apy'
import { Deposit } from 'components/Earn/Farm/Table/Columns/Deposit'
import DepositCap from 'components/Earn/Farm/Table/Columns/DepositCap'
import MaxLTV from 'components/Earn/Farm/Table/Columns/MaxLTV'
import Name from 'components/Earn/Farm/Table/Columns/Name'
import TVL from 'components/Earn/Farm/Table/Columns/TVL'

interface Props {
  isLoading: boolean
}

export default function useAvailableColumns(props: Props) {
  return useMemo<ColumnDef<Vault | DepositedVault>[]>(() => {
    return [
      {
        header: 'Vault',
        accessorKey: 'name',
        cell: ({ row }) => <Name vault={row.original as Vault} />,
      },
      {
        accessorKey: 'apy',
        header: 'APY',
        cell: ({ row }) => <Apy vault={row.original as Vault} />,
      },
      {
        accessorKey: 'tvl',
        header: 'TVL',
        cell: ({ row }) => <TVL vault={row.original as Vault} isLoading={props.isLoading} />,
      },
      {
        accessorKey: 'cap',
        header: 'Deposit Cap',
        cell: ({ row }) => <DepositCap vault={row.original as Vault} isLoading={props.isLoading} />,
      },
      {
        accessorKey: 'ltv.max',
        header: 'Max LTV',
        cell: ({ row }) => <MaxLTV vault={row.original as Vault} isLoading={props.isLoading} />,
      },
      {
        accessorKey: 'details',
        enableSorting: false,
        header: 'Deposit',
        cell: ({ row }) => <Deposit vault={row.original as Vault} isLoading={props.isLoading} />,
      },
    ]
  }, [props.isLoading])
}
